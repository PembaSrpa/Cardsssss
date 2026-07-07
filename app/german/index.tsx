import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  AVAILABLE_GERMAN_LEVELS,
  useGermanData,
} from "../../hooks/useGermanData";
import { useProgress } from "../../hooks/useProgress";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { UI_STORAGE_KEYS } from "../../store/uiStore";

export default function GermanLevelScreen(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title="Deutsch Artikel" right={<ThemeToggle />} />
        {AVAILABLE_GERMAN_LEVELS.map((level) => (
          <LevelCard key={level} level={level} />
        ))}
      </ScrollView>
    </View>
  );
}

interface ResumeState {
  index: number;
  score: number;
  streak: number;
}

function LevelCard({ level }: { level: string }): React.JSX.Element {
  const { colors } = useTheme();
  const { words } = useGermanData(level);
  const { getGermanScore } = useProgress();
  const ids = words.map((w) => w.id);
  const score = getGermanScore(level, ids);
  const total = score.correct + score.incorrect;
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : null;

  const [resume, setResume] = useState<ResumeState | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      (async () => {
        const [lastLevel, indexRaw, scoreRaw, streakRaw] = await Promise.all([
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_SCORE),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_STREAK),
        ]);
        if (!isMounted) return;
        const index = indexRaw ? parseInt(indexRaw, 10) : 0;
        if (lastLevel === level && index > 0) {
          setResume({ index, score: scoreRaw ? parseInt(scoreRaw, 10) : 0, streak: streakRaw ? parseInt(streakRaw, 10) : 0 });
        } else {
          setResume(null);
        }
      })();
      return () => {
        isMounted = false;
      };
    }, [level])
  );

  const startFresh = async (): Promise<void> => {
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL, level);
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX, "0");
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_SCORE, "0");
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_GERMAN_STREAK, "0");
    router.push(`/german/${level}`);
  };

  const continuePrevious = (): void => {
    if (!resume) return;
    router.push({
      pathname: "/german/[level]",
      params: {
        level,
        resumeIndex: String(resume.index),
        resumeScore: String(resume.score),
        resumeStreak: String(resume.streak),
      },
    });
  };

  return (
    <View
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt },
      ]}
    >
      <Pressable onPress={resume ? continuePrevious : startFresh} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>
        <View style={styles.cardTop}>
          <Text style={[styles.levelCode, { color: colors.text }]}>{level}</Text>
          <Text style={[styles.accuracy, { color: colors.textMuted }]}>
            {accuracy !== null ? `${accuracy}% accuracy` : "not started"}
          </Text>
        </View>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {words.length} words
        </Text>
      </Pressable>

      {resume && (
        <View style={[styles.resumeRow, { borderTopColor: colors.border }]}>
          <Pressable
            onPress={continuePrevious}
            style={({ pressed }) => [styles.resumeBtn, { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.resumeBtnLabel, { color: colors.accent }]}>
              Continue (word {resume.index + 1})
            </Text>
          </Pressable>
          <Pressable
            onPress={startFresh}
            style={({ pressed }) => [styles.resumeBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
          >
            <Text style={[styles.resumeBtnLabel, { color: colors.textMuted }]}>Start over</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 14 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelCode: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },
  accuracy: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs },
  count: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 8 },
  resumeRow: { flexDirection: "row", gap: 8, marginTop: 14, paddingTop: 14, borderTopWidth: 1 },
  resumeBtn: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  resumeBtnLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs },
});
