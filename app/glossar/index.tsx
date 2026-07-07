import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import { GLOSSAR_LEVELS, GLOSSAR_KAPITEL_COUNT, isB2Level, getGlossarLevelLabel } from "../../hooks/useGlossarData";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";

export default function GlossarLevelScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title="Deutsch Glossaries" right={<ThemeToggle />} />
        {GLOSSAR_LEVELS.map((level) => (
          <LevelCard key={level} level={level} />
        ))}
      </ScrollView>
    </View>
  );
}

function LevelCard({ level }: { level: string }): React.JSX.Element {
  const { colors } = useTheme();
  const kapitelCount = GLOSSAR_KAPITEL_COUNT[level as keyof typeof GLOSSAR_KAPITEL_COUNT];

  return (
    <Pressable
      onPress={() => router.push(`/glossar/${level}`)}
      style={({ pressed }) => [
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.levelCode, { color: colors.text }]}>{getGlossarLevelLabel(level)}</Text>
      <Text style={[styles.count, { color: colors.textMuted }]}>
        {kapitelCount} Kapitel{isB2Level(level) ? " · 4 Module each" : ""}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 14 },
  levelCode: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg },
  count: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 8 },
});
