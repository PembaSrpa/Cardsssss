import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
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

// Expo Go (SDK 53+) removed remote/push registration entirely, and
// `expo-notifications` runs push-token auto-registration as a side effect of
// being imported — which throws immediately inside Expo Go, before any of
// our code even runs. We only `require` the module lazily, and only when we
// know we're not in Expo Go, so that side effect never fires there. Local
// scheduled reminders (the only thing this hook actually uses) would work
// fine in a dev/standalone build; in Expo Go this hook simply no-ops.
const isExpoGo = Constants.appOwnership === "expo";

 
type NotificationsModule = any;

let cachedModule: NotificationsModule | null = null;

function getNotificationsModule(): NotificationsModule | null {
  if (isExpoGo) {
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
    return null;
  }
}

async function requestPermissions(): Promise<boolean> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

async function scheduleRecurringReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(
    REMINDER_IDENTIFIER,
  ).catch(() => undefined);
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
}

async function cancelRecurringReminder(): Promise<void> {
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return;
  }
  await Notifications.cancelScheduledNotificationAsync(
    REMINDER_IDENTIFIER,
  ).catch(() => undefined);
}

export function useNotifications(): UseNotificationsResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] =
    useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function init(): Promise<void> {
      if (isExpoGo) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      const stored = await AsyncStorage.getItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      );
      const wasEnabled = stored === "true";

      if (wasEnabled) {
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
    if (isExpoGo) {
      return false;
    }
    const granted = await requestPermissions();
    if (granted) {
      await scheduleRecurringReminder();
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "true");
      setNotificationsEnabled(true);
    }
    return granted;
  }, []);

  const disableNotifications = useCallback(async (): Promise<void> => {
    if (isExpoGo) {
      return;
    }
    await cancelRecurringReminder();
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, "false");
    setNotificationsEnabled(false);
  }, []);

  return {
    isLoading,
    notificationsEnabled,
    notificationsSupported: !isExpoGo,
    enableNotifications,
    disableNotifications,
  };
}
