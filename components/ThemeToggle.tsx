import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export function ThemeToggle(): React.JSX.Element {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.backgroundAlt }]}
    >
      <Ionicons
        name={mode === "dark" ? "moon-outline" : "sunny-outline"}
        size={18}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
