import React, { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { GermanArtikel } from "../hooks/useGermanData";

export type FeedbackState = "idle" | "correct" | "incorrect";

// Fixed exception to the neutral/orange palette: used exclusively for the
// swipe-feedback border below, nowhere else in the app.
const FEEDBACK_CORRECT = "#22c55e";
const FEEDBACK_INCORRECT = "#ef4444";

interface ArtikelCardProps {
  word: string;
  feedbackState: FeedbackState;
  onSwipe: (artikel: GermanArtikel) => void;
}

const SCREEN_WIDTH = Dimensions.get("window").width;
const SWIPE_THRESHOLD = 100;

export function ArtikelCard({ word, feedbackState, onSwipe }: ArtikelCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const translateX = useSharedValue<number>(0);
  const translateY = useSharedValue<number>(0);
  const borderOpacity = useSharedValue<number>(0);

  useEffect(() => {
    if (feedbackState !== "idle") {
      borderOpacity.value = 1;
      borderOpacity.value = withTiming(0, { duration: 600 });
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    }
  }, [feedbackState, borderOpacity, translateX, translateY]);

  const handleSwipeEnd = (artikel: GermanArtikel): void => {
    onSwipe(artikel);
  };

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const { translationX, translationY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      if (absX > SWIPE_THRESHOLD && absX > absY) {
        const direction = translationX > 0 ? "das" : "der";
        translateX.value = withTiming(translationX > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH, { duration: 250 });
        runOnJS(handleSwipeEnd)(direction as GermanArtikel);
      } else if (translationY > SWIPE_THRESHOLD && absY > absX) {
        translateY.value = withTiming(600, { duration: 250 });
        runOnJS(handleSwipeEnd)("die");
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotateZ: `${translateX.value / 20}deg` },
    ],
  }));

  const borderStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const isCorrect = feedbackState === "correct";

  return (
    <View style={styles.wrapper}>
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.card,
            cardStyle,
            { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
          ]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedbackBorder,
              borderStyle,
              {
                borderColor: isCorrect ? FEEDBACK_CORRECT : FEEDBACK_INCORRECT,
                borderWidth: 3,
                borderStyle: "solid",
              },
            ]}
          />
          <Text style={[styles.word, { color: colors.text }]}>{word}</Text>
          {feedbackState !== "idle" && (
            <Text style={[styles.resultMark, { color: isCorrect ? FEEDBACK_CORRECT : FEEDBACK_INCORRECT }]}>
              {isCorrect ? "✓" : "✕"}
            </Text>
          )}
        </Animated.View>
      </GestureDetector>

      <View style={styles.hintRow}>
        <Text style={[styles.hintLabel, { color: colors.textMuted, borderColor: colors.border }]}>← der</Text>
        <Text style={[styles.hintLabel, { color: colors.textMuted, borderColor: colors.border }]}>↓ die</Text>
        <Text style={[styles.hintLabel, { color: colors.textMuted, borderColor: colors.border }]}>das →</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    aspectRatio: 0.9,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  feedbackBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  word: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
    textAlign: "center",
  },
  resultMark: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    marginTop: 16,
  },
  hintRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  hintLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
});
