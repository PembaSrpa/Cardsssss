import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { useProgress } from "../../hooks/useProgress";
import { AVAILABLE_GERMAN_LEVELS, useGermanData } from "../../hooks/useGermanData";

const LEVEL_DESCRIPTIONS: { [level: string]: string } = {
  A1: "beginner basics",
  A2: "elementary vocabulary",
  B1: "intermediate range",
};

export default function GermanLevelScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>← back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>German Artikel</Text>

        {AVAILABLE_GERMAN_LEVELS.map((level) => (
          <LevelCard key={level} level={level} />
        ))}
      </ScrollView>
    </View>
  );
}

function LevelCard({ level }: { level: string }): React.JSX.Element {
  const { colors } = useTheme();
  const { words } = useGermanData(level);
  const { getGermanScore } = useProgress();

  const ids = words.map((w) => w.id);
  const score = getGermanScore(level, ids);
  const total = score.correct + score.incorrect;
  const accuracy = total > 0 ? Math.round((score.correct / total) * 100) : null;

  return (
    <Pressable
      onPress={() => router.push(`/german/${level}`)}
      style={({ pressed }) => [
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.cardTop}>
        <Text style={[styles.levelCode, { color: colors.text }]}>{level}</Text>
        <Text style={[styles.accuracy, { color: colors.textMuted }]}>
          {accuracy !== null ? `${accuracy}% accuracy` : "not started"}
        </Text>
      </View>
      <Text style={[styles.desc, { color: colors.textMuted }]}>{LEVEL_DESCRIPTIONS[level] ?? ""}</Text>
      <Text style={[styles.count, { color: colors.textMuted }]}>{words.length} words</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 16,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xl,
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelCode: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
  },
  accuracy: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    marginTop: 6,
  },
  count: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    marginTop: 8,
  },
});
