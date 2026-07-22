import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode = "light" | "dark";

export interface ThemeColors {
  background: string;
  backgroundAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
}

const LIGHT: ThemeColors = {
  background: "#FFFFFF",
  backgroundAlt: "#F5F5F5",
  text: "#262626",
  textMuted: "#404040",
  border: "#D4D4D4",
  accent: "#EAB308",
};

const DARK: ThemeColors = {
  background: "#000000",
  backgroundAlt: "#171717",
  text: "#E5E5E5",
  textMuted: "#D4D4D4",
  border: "#262626",
  accent: "#FACC15",
};

const STORAGE_KEY = "cards_theme_mode";

interface ThemeContextValue {
  mode: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>(systemScheme === "dark" ? "dark" : "light");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    async function load(): Promise<void> {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (isMounted && (stored === "light" || stored === "dark")) {
        setMode(stored);
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next: ThemeMode = prev === "light" ? "dark" : "light";
      AsyncStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = useMemo<ThemeColors>(() => (mode === "dark" ? DARK : LIGHT), [mode]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, colors, toggleTheme, isLoading }),
    [mode, colors, toggleTheme, isLoading]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
