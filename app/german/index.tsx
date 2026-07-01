import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

const LEVEL_DESCRIPTIONS: { [level: string]: string } = {
  A1: "beginner basics",
  A2: "elementary vocabulary",
  B1: "intermediate range",
};

export default function GermanLevelScreen(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title="German Artikel" right={<ThemeToggle />} />
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
        {
          borderColor: colors.border,
          backgroundColor: colors.backgroundAlt,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <Text style={[styles.levelCode, { color: colors.text }]}>{level}</Text>
        <Text style={[styles.accuracy, { color: colors.textMuted }]}>
          {accuracy !== null ? `${accuracy}% accuracy` : "not started"}
        </Text>
      </View>
      <Text style={[styles.desc, { color: colors.textMuted }]}>
        {LEVEL_DESCRIPTIONS[level] ?? ""}
      </Text>
      <Text style={[styles.count, { color: colors.textMuted }]}>
        {words.length} words
      </Text>
    </Pressable>
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
  desc: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, marginTop: 6 },
  count: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 8 },
});
