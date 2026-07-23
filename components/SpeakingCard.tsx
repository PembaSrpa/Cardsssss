import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Gesture, GestureDetector, ScrollView } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  runOnJS,
} from "react-native-reanimated";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { StatusBadge } from "./StatusBadge";
import { IELTSSpeakingQuestion } from "../hooks/useIELTSSpeakingData";

interface SpeakingCardProps {
  item: IELTSSpeakingQuestion;
  flipped: boolean;
  onPress: () => void;
}

function partLabel(part: number): string {
  if (part === 2) {
    return "PART 2 - CUE CARD";
  }
  return `PART ${part}`;
}

export function SpeakingCard({ item, flipped, onPress }: SpeakingCardProps): React.JSX.Element {
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
          { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
        ]}
      >
        <StatusBadge label={partLabel(item.part)} />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={[styles.question, { color: colors.text }]}>{item.question}</Text>
          {!!item.cueCardPoints && item.cueCardPoints.length > 0 && (
            <View style={styles.cuePoints}>
              <Text style={[styles.cueLabel, { color: colors.textMuted }]}>You should say:</Text>
              {item.cueCardPoints.map((point, idx) => (
                <Text key={idx} style={[styles.cueItem, { color: colors.textMuted }]}>
                  {`\u2022 ${point}`}
                </Text>
              ))}
            </View>
          )}
        </ScrollView>
        <Text style={[styles.hint, { color: colors.textMuted }]}>tap to flip</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.face,
          styles.faceAbsolute,
          backStyle,
          { backgroundColor: colors.backgroundAlt, borderColor: colors.border },
        ]}
      >
        <StatusBadge label="EXAMPLE ANSWER" />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={[styles.answer, { color: colors.text }]}>{item.answer}</Text>
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
    height: 560,
  },
  face: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    backfaceVisibility: "hidden",
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
    paddingVertical: 12,
  },
  question: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    lineHeight: 28,
  },
  cuePoints: {
    marginTop: 16,
  },
  cueLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 6,
  },
  cueItem: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 20,
    marginBottom: 4,
  },
  hint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    textAlign: "center",
    marginTop: 8,
  },
  answer: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    lineHeight: 22,
  },
});