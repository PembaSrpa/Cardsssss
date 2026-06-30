import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

interface StatusBadgeProps {
  label: string;
}

export function StatusBadge({ label }: StatusBadgeProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={[styles.badge, { borderColor: colors.border, backgroundColor: colors.backgroundAlt }]}>
      <Text style={[styles.text, { color: colors.textMuted }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.5,
  },
});
