import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

interface StatChipProps {
  label: string;
  value: string;
}

export function StatChip({ label, value }: StatChipProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.chip,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt },
      ]}
    >
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
  },
  value: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md, marginTop: 2 },
});
