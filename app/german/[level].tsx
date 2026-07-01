import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ArtikelCard, FeedbackState } from "../../components/ArtikelCard";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import { GermanArtikel, useGermanData } from "../../hooks/useGermanData";
import { useProgress } from "../../hooks/useProgress";
import { UI_STORAGE_KEYS } from "../../store/uiStore";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";

export default function GermanGameScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    level: string;
    resumeIndex?: string;
  }>();
  const level = params.level ?? "";
  const resumeIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;

  const { words, isLoading } = useGermanData(level);
  const { recordGermanAnswer } = useProgress();

  const [index, setIndex] = useState<number>(resumeIndex);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");

  useEffect(() => {
    if (!level) return;
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL, level);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX, String(index));
  }, [level, index]);

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
    }, 700);
  };

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
      <Scales variant="compact" edges={["left", "right", "bottom"]} />
      <View style={styles.content}>
        <NavBar title={level} right={<ThemeToggle />} />
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: colors.text }]}>
            SCORE {score}
          </Text>
          <Text style={[styles.statsText, { color: colors.text }]}>
            STREAK {streak}
          </Text>
          <Text style={[styles.statsText, { color: colors.textMuted }]}>
            {Math.min(index + 1, words.length)} / {words.length}
          </Text>
        </View>
        <View style={styles.cardArea}>
          {currentWord ? (
            <ArtikelCard
              word={currentWord.word}
              correctArtikel={currentWord.artikel}
              feedbackState={feedbackState}
              onSwipe={handleSwipe}
            />
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
  root: { flex: 1 },
  loading: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    marginTop: 80,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 56,
    paddingBottom: 40,
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
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
  },
});
