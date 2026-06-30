import React from "react";
import { Pressable, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

interface AppButtonProps {
  label: string;
  onPress: () => void;
  active?: boolean;
  style?: ViewStyle;
}

export function AppButton({ label, onPress, active = false, style }: AppButtonProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: colors.accent,
          backgroundColor: active ? colors.accent : colors.backgroundAlt,
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.backgroundAlt : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 0.3,
  },
});
