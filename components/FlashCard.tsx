import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { IELTSWord } from "../hooks/useIELTSData";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { StatusBadge } from "./StatusBadge";

interface FlashCardProps {
  word: IELTSWord;
  flipped: boolean;
  onPress: () => void;
}

export function FlashCard({
  word,
  flipped,
  onPress,
}: FlashCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const rotation = useSharedValue<number>(0);

  useEffect(() => {
    rotation.value = withTiming(flipped ? 180 : 0, { duration: 300 });
  }, [flipped, rotation]);

  const frontStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [0, 180],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value < 90 ? 1 : 0,
    };
  });

  const backStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(
      rotation.value,
      [0, 180],
      [180, 360],
      Extrapolation.CLAMP,
    );
    return {
      transform: [{ perspective: 1200 }, { rotateY: `${rotateY}deg` }],
      opacity: rotation.value >= 90 ? 1 : 0,
    };
  });

  const tapGesture = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      runOnJS(onPress)();
    }
  });

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View style={styles.wrapper}>
        <Animated.View
          style={[
            styles.face,
            frontStyle,
            {
              backgroundColor: colors.backgroundAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.word, { color: colors.text }]}>{word.word}</Text>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            tap to flip
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.face,
            styles.faceAbsolute,
            backStyle,
            {
              backgroundColor: colors.backgroundAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <StatusBadge label={word.type} />
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={[styles.meaning, { color: colors.text }]}>
              {word.meaning}
            </Text>
            <Text style={[styles.example, { color: colors.textMuted }]}>
              {word.example}
            </Text>

            {word.synonyms.length > 0 && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
                  SYN
                </Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>
                  {word.synonyms.join(", ")}
                </Text>
              </View>
            )}
            {word.antonyms.length > 0 && (
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: colors.textMuted }]}>
                  ANT
                </Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>
                  {word.antonyms.join(", ")}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
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
    overflow: "hidden",
  },
  faceAbsolute: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 4,
  },
  word: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    textAlign: "center",
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
    marginTop: 14,
  },
  example: {
    fontFamily: FONTS.regular,
    fontStyle: "italic",
    fontSize: FONT_SIZES.sm,
    marginTop: 10,
    lineHeight: 20,
  },
  row: {
    marginTop: 16,
  },
  rowLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
  },
  rowValue: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
});
