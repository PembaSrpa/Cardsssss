import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";
import { FlashCard } from "../../../../components/FlashCard";
import { AppButton } from "../../../../components/AppButton";
import { NavBar } from "../../../../components/NavBar";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { Scales } from "../../../../components/Scales";
import { useIELTSData } from "../../../../hooks/useIELTSData";
import { UI_STORAGE_KEYS, ieltsListIndexKey } from "../../../../store/uiStore";

export default function IELTSFlashcardsScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ group: string; section: string; start?: string }>();
  const section = params.section ?? "";
  const startParam = params.start ? parseInt(params.start, 10) : 0;

  const { words, title, isLoading } = useIELTSData(section);

  const [index, setIndex] = useState<number>(startParam);
  const [flipped, setFlipped] = useState<boolean>(false);

  // Clamp once word count is known, in case a stale resume index points
  // past the end of a list that's since shrunk.
  useEffect(() => {
    if (words.length > 0 && index > words.length - 1) {
      setIndex(words.length - 1);
    }
  }, [words.length, index]);

  // Persist both the per-list resume position (used by this list's own
  // "Continue" button) and the global "last visited" position (used by
  // the home screen's Continue card) on every move.
  useEffect(() => {
    AsyncStorage.setItem(ieltsListIndexKey(section), String(index));
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_SECTION, section);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_INDEX, String(index));
  }, [section, index]);

  const currentWord = words[index];

  const goNext = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.min(prev + 1, words.length - 1));
  };

  const goPrev = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  // Swipe left/right to move between cards, alongside the prev/next buttons.
  // activeOffsetX keeps this from stealing the flip tap on FlashCard —
  // the pan only takes over once the finger has actually moved sideways.
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
        <Text style={[styles.loading, { color: colors.textMuted }]}>loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <View style={styles.inner}>
        <NavBar title={title || section} right={<ThemeToggle />} />

        {currentWord ? (
          <>
            <View style={styles.navRow}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {index + 1} / {words.length}
              </Text>
            </View>

            <GestureDetector gesture={swipeGesture}>
              <Animated.View style={[styles.cardArea, swipeCardStyle]}>
                <FlashCard word={currentWord} flipped={flipped} onPress={() => setFlipped((f) => !f)} />
              </Animated.View>
            </GestureDetector>

            <View style={styles.actionRow}>
              <AppButton label="← prev" onPress={goPrev} disabled={index === 0} style={styles.actionButton} />
              <AppButton
                label="next →"
                onPress={goNext}
                disabled={index === words.length - 1}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>no cards found</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 24 },
  loading: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, marginTop: 40, textAlign: "center" },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  progressLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, textAlign: "center" },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 8, marginTop: 16, width: "100%", maxWidth: 420, alignSelf: "center" },
  actionButton: { flex: 1 },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center", marginTop: 60 },
});
