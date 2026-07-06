import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { STORAGE_KEYS } from "../store/progressStore";
import { getAllIELTSWordsFlat, IELTSWord } from "./useIELTSData";

// Every scheduled vocab notification uses this identifier prefix, followed
// by its slot number. Reusing a fixed set of identifiers means re-scheduling
// is just "overwrite slot N" instead of having to track an ever-growing list
// of one-off ids.
const SLOT_PREFIX = "cards_vocab_slot_";

// Presets the user can pick from for how often a new word arrives.
export const INTERVAL_PRESET_MINUTES = [5, 10, 15, 30, 60] as const;
export const DEFAULT_INTERVAL_MINUTES = 10;

// iOS caps an app at 64 pending local notifications at once, so no matter
// how short the interval is, we never schedule more than this many slots in
// a single batch. Shorter intervals simply cover less real time per batch —
// the AppState-triggered refill (see below) keeps the queue topped up.
const MAX_SLOTS = 60;
const MIN_SLOTS = 10;

function computeBatchSize(intervalMinutes: number): number {
  const slotsForOneDay = Math.ceil((24 * 60) / intervalMinutes);
  return Math.min(MAX_SLOTS, Math.max(MIN_SLOTS, slotsForOneDay));
}

// Refill once the queue drains to roughly a fifth of a batch, so there's
// always a decent buffer left before it could run dry.
function computeRefillThreshold(batchSize: number): number {
  return Math.max(3, Math.ceil(batchSize / 5));
}

export interface UseNotificationsResult {
  isLoading: boolean;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  intervalMinutes: number;
  setIntervalMinutes: (minutes: number) => Promise<void>;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
}

// This app only ever schedules LOCAL notifications — it never registers for
// a push token. Local notifications work fine in Expo Go (only *remote push*
// was removed from Expo Go starting SDK 53), so there is no need to disable
// this feature there. We still lazily require the module and wrap every call
// in try/catch so an unsupported platform (e.g. web, or a bare simulator
// without notification support) degrades to a no-op instead of crashing.
type NotificationsModule = any;

let cachedModule: NotificationsModule | null = null;
let moduleLoadFailed = false;

function getNotificationsModule(): NotificationsModule | null {
  if (moduleLoadFailed) {
    return null;
  }
  if (cachedModule) {
    return cachedModule;
  }
  try {
     
    const mod = require("expo-notifications") as NotificationsModule;
    mod.setNotificationHandler({
      handleNotification: async () => ({
        // `shouldShowAlert` is deprecated as of expo-notifications ~0.27+ and
        // is a no-op on current SDKs (iOS split "alert" into banner + list
        // surfaces). Without shouldShowBanner/shouldShowList set, foreground
        // notifications are silently suppressed — they fire, but nothing is
        // ever displayed. Both must be set explicitly.
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    // Android 8+ silently drops any notification that isn't assigned to a
    // channel — no error is thrown, it just never appears. This must exist
    // before anything is scheduled.
    if (Platform.OS === "android") {
      mod.setNotificationChannelAsync("vocab-reminders", {
        name: "Vocabulary reminders",
        importance: mod.AndroidImportance.HIGH,
      }).catch(() => undefined);
    }
    cachedModule = mod;
    return mod;
  } catch {
    moduleLoadFailed = true;
    return null;
  }
}

async function requestPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }
  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) {
      return true;
    }
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch {
    return false;
  }
}

// Builds the notification title/body for a single vocab word, packing in
// word / meaning / synonyms / antonyms as requested.
function formatWordNotification(word: IELTSWord): { title: string; body: string } {
  const title = `📚 ${word.word}${word.type ? ` (${word.type})` : ""}`;
  const lines = [word.meaning];
  if (word.synonyms?.length) {
    lines.push(`Synonyms: ${word.synonyms.join(", ")}`);
  }
  if (word.antonyms?.length) {
    lines.push(`Antonyms: ${word.antonyms.join(", ")}`);
  }
  return { title, body: lines.join("\n") };
}

async function getNextWordIndex(): Promise<number> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_NOTIF_INDEX);
  const parsed = stored ? parseInt(stored, 10) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

async function setNextWordIndex(index: number): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.VOCAB_NOTIF_INDEX, String(index));
}

async function getStoredIntervalMinutes(): Promise<number> {
  const stored = await AsyncStorage.getItem(STORAGE_KEYS.VOCAB_NOTIF_INTERVAL_MINUTES);
  const parsed = stored ? parseInt(stored, 10) : DEFAULT_INTERVAL_MINUTES;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_INTERVAL_MINUTES;
}

// Cancels every currently-scheduled vocab slot. Called before scheduling a
// fresh batch so leftover slots from a previous (possibly larger) batch size
// or a previous interval never linger.
async function cancelVocabQueue(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ours = scheduled.filter((n: any) => n.identifier?.startsWith(SLOT_PREFIX));
    await Promise.all(
      ours.map((n: any) => Notifications.cancelScheduledNotificationAsync(n.identifier).catch(() => undefined))
    );
  } catch {
    // no-op
  }
}

// Schedules a fresh batch of upcoming notifications at the given interval,
// continuing from wherever the persisted word pointer left off, and
// advances the pointer past the words it just used. Always starts from a
// clean slate (cancels anything previously queued) so switching intervals
// can't leave stale slots at the old cadence.
async function scheduleVocabBatch(intervalMinutes: number): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  const words = getAllIELTSWordsFlat();
  if (words.length === 0) {
    return;
  }

  await cancelVocabQueue();

  const intervalSeconds = intervalMinutes * 60;
  const batchSize = computeBatchSize(intervalMinutes);
  const startIndex = await getNextWordIndex();

  try {
    for (let slot = 0; slot < batchSize; slot++) {
      const word = words[(startIndex + slot) % words.length];
      const { title, body } = formatWordNotification(word);
      await Notifications.scheduleNotificationAsync({
        identifier: `${SLOT_PREFIX}${slot}`,
        content: {
          title,
          body,
          ...(Platform.OS === "android" ? { channelId: "vocab-reminders" } : {}),
        },
        trigger: {
          // Slot 0 fires almost immediately so enabling notifications (or
          // changing the interval) gives instant feedback that it's
          // working, instead of a silent wait. Every slot after that
          // follows the chosen cadence.
          seconds: slot === 0 ? 5 : intervalSeconds * slot,
          repeats: false,
        },
      });
    }
    await setNextWordIndex((startIndex + batchSize) % words.length);
  } catch {
    // Scheduling isn't supported on this platform/runtime — no-op.
  }
}

// If the queue has drained below the threshold (i.e. the app has been open
// long enough, or was reopened after enough time passed, that most of the
// batch already fired), top it back up with a fresh batch continuing from
// the persisted pointer.
async function refillVocabQueueIfNeeded(intervalMinutes: number): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const pending = scheduled.filter((n: any) => n.identifier?.startsWith(SLOT_PREFIX));
    const batchSize = computeBatchSize(intervalMinutes);
    if (pending.length < computeRefillThreshold(batchSize)) {
      await scheduleVocabBatch(intervalMinutes);
    }
  } catch {
    // no-op
  }
}

export function useNotifications(): UseNotificationsResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(true);
  const [intervalMinutes, setIntervalMinutesState] = useState<number>(DEFAULT_INTERVAL_MINUTES);
  const enabledRef = useRef<boolean>(false);
  const intervalRef = useRef<number>(DEFAULT_INTERVAL_MINUTES);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      const [stored, storedInterval] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
        getStoredIntervalMinutes(),
      ]);
      const wasEnabled = stored === "true";

      const supported = getNotificationsModule() !== null;
      if (isMounted) {
        setNotificationsSupported(supported);
        setIntervalMinutesState(storedInterval);
      }
      intervalRef.current = storedInterval;

      if (wasEnabled && supported) {
        const granted = await requestPermissions();
        if (granted) {
          await refillVocabQueueIfNeeded(storedInterval);
        }
        if (isMounted) {
          setNotificationsEnabled(granted);
          enabledRef.current = granted;
        }
      }

      if (isMounted) {
        setIsLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  // Top up the queue whenever the app comes back to the foreground, so a
  // reminder set never runs dry just because the app was closed for a while.
  useEffect(() => {
    const handleAppStateChange = (state: AppStateStatus): void => {
      if (state === "active" && enabledRef.current) {
        refillVocabQueueIfNeeded(intervalRef.current);
      }
    };
    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleVocabBatch(intervalRef.current);
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "true");
      setNotificationsEnabled(true);
      enabledRef.current = true;
    }
    return granted;
  }, []);

  const disableNotifications = useCallback(async (): Promise<void> => {
    await cancelVocabQueue();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "false");
    setNotificationsEnabled(false);
    enabledRef.current = false;
  }, []);

  // Persists the new interval and, if notifications are currently on,
  // immediately reschedules the queue at the new cadence (starting with a
  // quick confirmation notification, same as first enabling).
  const setIntervalMinutes = useCallback(async (minutes: number): Promise<void> => {
    intervalRef.current = minutes;
    setIntervalMinutesState(minutes);
    await AsyncStorage.setItem(STORAGE_KEYS.VOCAB_NOTIF_INTERVAL_MINUTES, String(minutes));
    if (enabledRef.current) {
      await scheduleVocabBatch(minutes);
    }
  }, []);

  return {
    isLoading,
    notificationsEnabled,
    notificationsSupported,
    intervalMinutes,
    setIntervalMinutes,
    enableNotifications,
    disableNotifications,
  };
}
