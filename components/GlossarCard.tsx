import React, { useEffect } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { GlossarWord } from "../hooks/useGlossarData";

interface GlossarCardProps {
  word: GlossarWord;
  flipped: boolean;
  onPress: () => void;
}

export function GlossarCard({ word, flipped, onPress }: GlossarCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const rotation = useSharedValue<number>(0);

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, { duration: 300 });
  }, [flipped, rotation]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [0, 180], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value < 90 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(rotation.value, [0, 180], [180, 360], Extrapolation.CLAMP);
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value >= 90 ? 1 : 0,
    };
  });

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      <Animated.View
        style={[styles.face, frontStyle, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}
      >
        <Text style={[styles.word, { color: colors.text }]}>{word.word}</Text>
        {!!word.plural && (
          <Text style={[styles.plural, { color: colors.textMuted }]}>Pl. {word.plural}</Text>
        )}
        <Text style={[styles.hint, { color: colors.textMuted }]}>tap to flip</Text>
      </Animated.View>

      <Animated.View
        style={[styles.face, styles.faceAbsolute, backStyle, { backgroundColor: colors.backgroundAlt, borderColor: colors.border }]}
      >
        <Text style={[styles.meaning, { color: colors.text }]}>{word.meaning}</Text>
        {!!word.example && (
          <Text style={[styles.example, { color: colors.textMuted }]}>{word.example}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    aspectRatio: 0.72,
  },
  face: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    backfaceVisibility: "hidden",
    justifyContent: "center",
  },
  faceAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  word: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    textAlign: "center",
  },
  plural: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: "center",
    marginTop: 6,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    textAlign: "center",
    marginTop: 12,
  },
  meaning: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
    textAlign: "center",
  },
  example: {
    fontFamily: FONTS.regular,
    fontStyle: "italic",
    fontSize: FONT_SIZES.sm,
    marginTop: 12,
    lineHeight: 20,
    textAlign: "center",
  },
});
