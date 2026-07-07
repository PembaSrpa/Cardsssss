import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../theme/ThemeContext";

interface ProgressBarProps {
  progress: number;
  height?: number;
}

export function ProgressBar({ progress, height = 4 }: ProgressBarProps): React.JSX.Element {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped * 100}%`,
            height,
            backgroundColor: colors.accent,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: "100%",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 2,
  },
});
