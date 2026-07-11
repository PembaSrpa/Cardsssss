import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AppButton } from "../../../../components/AppButton";
import { GlossarCard } from "../../../../components/GlossarCard";
import { NavBar } from "../../../../components/NavBar";
import { Scales } from "../../../../components/Scales";
import { StatChip } from "../../../../components/StatChip";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import {
  getGlossarLevelLabel,
  useGlossarKapitel,
} from "../../../../hooks/useGlossarData";
import {
  UI_STORAGE_KEYS,
  glossarListIndexKey,
} from "../../../../store/uiStore";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";

export default function GlossarFlashcardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    level: string;
    kapitel: string;
    start?: string;
  }>();
  const level = params.level ?? "";
  const kapitel = params.kapitel ? parseInt(params.kapitel, 10) : 1;
  const startParam = params.start ? parseInt(params.start, 10) : 0;

  const { words, isLoading } = useGlossarKapitel(level, kapitel);

  const [index, setIndex] = useState<number>(startParam);
  const [flipped, setFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (words.length > 0 && index > words.length) {
      setIndex(words.length);
    }
  }, [words.length, index]);

  useEffect(() => {
    AsyncStorage.setItem(glossarListIndexKey(level, kapitel), String(index));
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GLOSSAR_LEVEL, level);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GLOSSAR_KAPITEL, String(kapitel));
    AsyncStorage.removeItem(UI_STORAGE_KEYS.LAST_GLOSSAR_MODULE);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GLOSSAR_INDEX, String(index));
  }, [level, kapitel, index]);

  const isFinished = words.length > 0 && index >= words.length;
  const currentWord = words[index];

  const goNext = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.min(prev + 1, words.length));
  };

  const goPrev = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const reviewAgain = (): void => {
    setFlipped(false);
    setIndex(0);
  };

  const translateX = useSharedValue<number>(0);
  const SWIPE_THRESHOLD = 60;

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-25, 25])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX } = event;
      translateX.value = withSpring(0);
      if (translationX < -SWIPE_THRESHOLD) {
        runOnJS(goNext)();
      } else if (translationX > SWIPE_THRESHOLD) {
        runOnJS(goPrev)();
      }
    });

  const swipeCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>
          loading…
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <View style={styles.inner}>
        <NavBar
          title={`${getGlossarLevelLabel(level)} · Kapitel ${kapitel}`}
          right={<ThemeToggle />}
        />

        {words.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            no cards found
          </Text>
        ) : isFinished ? (
          <View style={styles.finishedBox}>
            <Text style={[styles.finishedTitle, { color: colors.text }]}>
              Kapitel complete
            </Text>
            <Text style={[styles.finishedScore, { color: colors.textMuted }]}>
              {words.length} / {words.length} reviewed
            </Text>
            <View style={styles.finishedActions}>
              <Pressable
                onPress={reviewAgain}
                style={({ pressed }) => [
                  styles.finishedBtn,
                  { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[styles.finishedBtnLabel, { color: colors.accent }]}
                >
                  Review again
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push(`/glossar/${level}/${kapitel}`)}
                style={({ pressed }) => [
                  styles.finishedBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.finishedBtnLabel, { color: colors.text }]}>
                  Back to list
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatChip label="CARD" value={`${index + 1}/${words.length}`} />
            </View>

            <GestureDetector gesture={swipeGesture}>
              <Animated.View style={[styles.cardArea, swipeCardStyle]}>
                <GlossarCard
                  word={currentWord}
                  flipped={flipped}
                  onPress={() => setFlipped((f) => !f)}
                />
              </Animated.View>
            </GestureDetector>

            <View style={styles.actionRow}>
              <AppButton
                label="← prev"
                onPress={goPrev}
                disabled={index === 0}
                style={styles.actionButton}
              />
              <AppButton
                label="next →"
                onPress={goNext}
                style={styles.actionButton}
              />
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 24 },
  loading: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    marginTop: 40,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    maxWidth: 200,
    alignSelf: "center",
    width: "100%",
  },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    marginTop: 16,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  actionButton: { flex: 1 },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
    marginTop: 60,
  },
  finishedBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  finishedTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl },
  finishedScore: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.md,
    marginTop: 8,
  },
  finishedActions: { flexDirection: "row", gap: 12, marginTop: 28 },
  finishedBtn: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  finishedBtnLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm },
});
