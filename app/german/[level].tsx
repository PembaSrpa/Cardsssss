import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { ArtikelCard, FeedbackState } from "../../components/ArtikelCard";
import { NavBar } from "../../components/NavBar";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Scales } from "../../components/Scales";
import { getGermanLevelWords, shuffleGermanWords, GermanArtikel, GermanWord } from "../../hooks/useGermanData";
import { useProgress } from "../../hooks/useProgress";
import { UI_STORAGE_KEYS } from "../../store/uiStore";

export default function GermanGameScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    level: string;
    resumeIndex?: string;
    resumeScore?: string;
    resumeStreak?: string;
  }>();
  const level = params.level ?? "";
  const resumeIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;
  const resumeScore = params.resumeScore ? parseInt(params.resumeScore, 10) : 0;
  const resumeStreak = params.resumeStreak ? parseInt(params.resumeStreak, 10) : 0;

  const { recordGermanAnswer } = useProgress();

  const [words, setWords] = useState<GermanWord[]>([]);
  const [wordsReady, setWordsReady] = useState<boolean>(false);
  const [index, setIndex] = useState<number>(resumeIndex);
  const [score, setScore] = useState<number>(resumeScore);
  const [streak, setStreak] = useState<number>(resumeStreak);
  const [feedbackState, setFeedbackState] = useState<FeedbackState>("idle");

  useEffect(() => {
    if (!level) return;
    setWordsReady(false);
    const rawWords = getGermanLevelWords(level);
    const ordered = shuffleGermanWords(rawWords);
    setWords(ordered);
    setWordsReady(true);
  }, [level]);

  useEffect(() => {
    if (!level) return;
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL, level);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX, String(index));
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_SCORE, String(score));
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_STREAK, String(streak));
  }, [level, index, score, streak]);

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

  if (!wordsReady) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="large" edges={["left", "right", "bottom"]} />
      <View style={styles.content}>
        <NavBar title={level} right={<ThemeToggle />} />
        <View style={styles.statsBar}>
          <Text style={[styles.statsText, { color: colors.text }]}>SCORE {score}</Text>
          <Text style={[styles.statsText, { color: colors.text }]}>STREAK {streak}</Text>
          <Text style={[styles.statsText, { color: colors.textMuted }]}>
            {Math.min(index + 1, words.length)} / {words.length}
          </Text>
        </View>
        <View style={styles.cardArea}>
          {currentWord ? (
            <ArtikelCard
              word={currentWord.word}
              meaning={currentWord.meaning}
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
  loading: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, marginTop: 80, textAlign: "center" },
  content: { flex: 1, paddingHorizontal: 40, paddingTop: 56, paddingBottom: 40 },
  statsBar: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statsText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, letterSpacing: 1 },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center" },
});
