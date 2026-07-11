import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ArtikelCard, FeedbackState } from "../../components/ArtikelCard";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { StatChip } from "../../components/StatChip";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  GermanArtikel,
  GermanWord,
  getGermanLevelWords,
  shuffleGermanWords,
} from "../../hooks/useGermanData";
import { useProgress } from "../../hooks/useProgress";
import { UI_STORAGE_KEYS } from "../../store/uiStore";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";

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
  const resumeStreak = params.resumeStreak
    ? parseInt(params.resumeStreak, 10)
    : 0;

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
  const isFinished = wordsReady && index >= words.length;

  const handleSwipe = async (guess: GermanArtikel): Promise<void> => {
    if (!currentWord) return;
    const wasCorrect = guess === currentWord.artikel;
    setFeedbackState(wasCorrect ? "correct" : "incorrect");
    setScore((s) => s + (wasCorrect ? 1 : 0));
    setStreak((s) => (wasCorrect ? s + 1 : 0));
    await recordGermanAnswer(currentWord.id, wasCorrect);
    setTimeout(() => {
      setFeedbackState("idle");
      setIndex((prev) => prev + 1);
    }, 1100);
  };

  const restart = (): void => {
    const reshuffled = shuffleGermanWords(words);
    setWords(reshuffled);
    setIndex(0);
    setScore(0);
    setStreak(0);
    setFeedbackState("idle");
  };

  if (!wordsReady) {
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
      <Scales variant="large" edges={["left", "right", "bottom"]} />
      <View style={styles.content}>
        <NavBar title={level} right={<ThemeToggle />} />

        <View style={styles.statsRow}>
          <StatChip label="SCORE" value={`${score}`} />
          <StatChip label="STREAK" value={`${streak}`} />
          <StatChip
            label="CARD"
            value={`${Math.min(index + 1, words.length)}/${words.length}`}
          />
        </View>

        {isFinished ? (
          <View style={styles.finishedBox}>
            <Text style={[styles.finishedTitle, { color: colors.text }]}>
              Deck complete
            </Text>
            <Text style={[styles.finishedScore, { color: colors.textMuted }]}>
              {score} / {words.length} correct
            </Text>
            <View style={styles.finishedActions}>
              <Pressable
                onPress={restart}
                style={({ pressed }) => [
                  styles.finishedBtn,
                  { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text
                  style={[styles.finishedBtnLabel, { color: colors.accent }]}
                >
                  Play again
                </Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/german")}
                style={({ pressed }) => [
                  styles.finishedBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.finishedBtnLabel, { color: colors.text }]}>
                  Choose level
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.cardArea}>
            {currentWord && (
              <ArtikelCard
                word={currentWord.word}
                meaning={currentWord.meaning}
                correctArtikel={currentWord.artikel}
                feedbackState={feedbackState}
                onSwipe={handleSwipe}
              />
            )}
          </View>
        )}
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
    paddingHorizontal: 44,
    paddingTop: 56,
    paddingBottom: 56,
  },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 28 },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  finishedBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -60,
  },
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
