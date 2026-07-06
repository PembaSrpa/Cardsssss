import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { STORAGE_KEYS } from "../store/progressStore";

const REMINDER_IDENTIFIER = "cards_study_reminder";
const REMINDER_INTERVAL_SECONDS = 30 * 60;
const REMINDER_MESSAGE = "Time to review your Cards! 📚";

export interface UseNotificationsResult {
  isLoading: boolean;
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  enableNotifications: () => Promise<boolean>;
  disableNotifications: () => Promise<void>;
}

// This app only ever schedules a LOCAL repeating reminder — it never
// registers for a push token. Local notifications work fine in Expo Go
// (only *remote push* was removed from Expo Go starting SDK 53), so there
// is no need to disable this feature there. We still lazily require the
// module and wrap every call in try/catch so an unsupported platform
// (e.g. web, or a bare simulator without notification support) degrades
// to a no-op instead of crashing.
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

async function scheduleRecurringReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => undefined);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_IDENTIFIER,
      content: {
        title: "Cards",
        body: REMINDER_MESSAGE,
      },
      trigger: {
        seconds: REMINDER_INTERVAL_SECONDS,
        repeats: true,
      },
    });
  } catch {
    // Scheduling isn't supported on this platform/runtime — no-op.
  }
}

async function cancelRecurringReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(REMINDER_IDENTIFIER).catch(() => undefined);
}

export function useNotifications(): UseNotificationsResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [notificationsSupported, setNotificationsSupported] = useState<boolean>(true);

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
          await scheduleRecurringReminder();
        }
        if (isMounted) {
          setNotificationsEnabled(granted);
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

  const enableNotifications = useCallback(async (): Promise<boolean> => {
    const granted = await requestPermissions();
    if (granted) {
      await scheduleRecurringReminder();
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "true");
      setNotificationsEnabled(true);
    }
    return granted;
  }, []);

  const disableNotifications = useCallback(async (): Promise<void> => {
    await cancelRecurringReminder();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "false");
    setNotificationsEnabled(false);
  }, []);

  return {
    isLoading,
    notificationsEnabled,
    notificationsSupported,
    enableNotifications,
    disableNotifications,
  };
}
