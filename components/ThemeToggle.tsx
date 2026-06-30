import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { FONT_SIZES } from "../theme/typography";

export function ThemeToggle(): React.JSX.Element {
  const { mode, colors, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={[styles.toggle, { borderColor: colors.border, backgroundColor: colors.backgroundAlt }]}
    >
      <Text style={[styles.icon, { color: colors.text }]}>{mode === "dark" ? "☾" : "☀"}</Text>
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
  icon: {
    fontSize: FONT_SIZES.md,
  },
});
