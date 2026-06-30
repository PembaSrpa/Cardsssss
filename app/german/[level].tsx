import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { ArtikelCard, FeedbackState } from "../../components/ArtikelCard";
import { Scales } from "../../components/Scales";
import { useGermanData, GermanArtikel } from "../../hooks/useGermanData";
import { useProgress } from "../../hooks/useProgress";

export default function GermanGameScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ level: string }>();
  const level = params.level ?? "";

  const { words, isLoading } = useGermanData(level);
  const { recordGermanAnswer } = useProgress();

  const [index, setIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");

  const currentWord = words[index];

  const handleSwipe = async (guess: GermanArtikel): Promise<void> => {
    if (!currentWord) return;
    const wasCorrect = guess === currentWord.artikel;
    setFeedbackState(wasCorrect ? "correct" : "incorrect");
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setStreak((s) => (wasCorrect ? s + 1 : 0));
    await recordGermanAnswer(currentWord.id, wasCorrect);

    setTimeout(() => {
      setFeedbackState("idle");
      setIndex((prev) => (prev + 1 < words.length ? prev + 1 : prev));
    }, 350);
  };

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right", "bottom"]} />

      <View style={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>← back</Text>
        </Pressable>

        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: colors.text }]}>SCORE {score}</Text>
          <Text style={[styles.statsText, { color: colors.text }]}>STREAK {streak}</Text>
          <Text style={[styles.statsText, { color: colors.textMuted }]}>
            {Math.min(index + 1, words.length)} / {words.length}
          </Text>
        </View>

        <View style={styles.cardArea}>
          {currentWord ? (
            <ArtikelCard word={currentWord.word} feedbackState={feedbackState} onSwipe={handleSwipe} />
          ) : (
            <Text style={[styles.empty, { color: colors.textMuted }]}>
              session complete — {score} / {words.length}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    marginTop: 80,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 18,
  },
  statsBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statsText: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1,
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
  },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
});
