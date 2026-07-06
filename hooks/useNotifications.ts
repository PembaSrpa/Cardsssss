import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { STORAGE_KEYS } from "../store/progressStore";
import { getAllIELTSWordsFlat, IELTSWord } from "./useIELTSData";

// Every scheduled vocab notification uses this identifier prefix, followed
// by its slot number (0..BATCH_SIZE-1). Reusing a fixed set of identifiers
// means re-scheduling is just "overwrite slot N" instead of having to track
// an ever-growing list of one-off ids.
const SLOT_PREFIX = "cards_vocab_slot_";
const INTERVAL_SECONDS = 30 * 60;
// How many words to queue up at once (48 * 30min = 24h of coverage).
const BATCH_SIZE = 48;
// Once fewer than this many slots are still pending, top the queue back up.
const REFILL_THRESHOLD = 6;

export interface UseNotificationsResult {
  isLoading: boolean;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
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
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
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

// Schedules BATCH_SIZE upcoming notifications, one every 30 minutes,
// continuing from wherever the persisted word pointer left off, and
// advances the pointer past the words it just used.
async function scheduleVocabBatch(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  const words = getAllIELTSWordsFlat();
  if (words.length === 0) {
    return;
  }

  const startIndex = await getNextWordIndex();

  try {
    for (let slot = 0; slot < BATCH_SIZE; slot++) {
      const word = words[(startIndex + slot) % words.length];
      const { title, body } = formatWordNotification(word);
      await Notifications.scheduleNotificationAsync({
        identifier: `${SLOT_PREFIX}${slot}`,
        content: { title, body },
        trigger: {
          seconds: INTERVAL_SECONDS * (slot + 1),
          repeats: false,
        },
      });
    }
    await setNextWordIndex((startIndex + BATCH_SIZE) % words.length);
  } catch {
    // Scheduling isn't supported on this platform/runtime — no-op.
  }
}

// If the queue has drained below the threshold (i.e. the app has been open
// long enough, or was reopened after enough time passed, that most of the
// batch already fired), top it back up with a fresh batch continuing from
// the persisted pointer.
async function refillVocabQueueIfNeeded(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const pending = scheduled.filter((n: any) => n.identifier?.startsWith(SLOT_PREFIX));
    if (pending.length < REFILL_THRESHOLD) {
      await scheduleVocabBatch();
    }
  } catch {
    // no-op
  }
}

async function cancelVocabQueue(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  for (let slot = 0; slot < BATCH_SIZE; slot++) {
    await Notifications.cancelScheduledNotificationAsync(`${SLOT_PREFIX}${slot}`).catch(() => undefined);
  }
}

export function useNotifications(): UseNotificationsResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(true);
  const enabledRef = useRef<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
      const wasEnabled = stored === "true";

      const supported = getNotificationsModule() !== null;
      if (isMounted) {
        setNotificationsSupported(supported);
      }

      if (wasEnabled && supported) {
        const granted = await requestPermissions();
        if (granted) {
          await refillVocabQueueIfNeeded();
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
        refillVocabQueueIfNeeded();
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
      await scheduleVocabBatch();
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

  return {
    isLoading,
    notificationsEnabled,
    notificationsSupported,
    enableNotifications,
    disableNotifications,
  };
}
