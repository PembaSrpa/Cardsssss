import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavBar } from "../../../components/NavBar";
import { Scales } from "../../../components/Scales";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { GLOSSAR_KAPITEL_COUNT, isB2Level, getGlossarKapitelWords } from "../../../hooks/useGlossarData";
import { getGlossarKapitelTitle } from "../../../constants/glossarKapitelTitles";
import { useTheme } from "../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../theme/typography";

export default function GlossarKapitelListScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ level: string }>();
  const level = params.level ?? "";
  const isB2 = isB2Level(level);
  const kapitelCount = GLOSSAR_KAPITEL_COUNT[level as keyof typeof GLOSSAR_KAPITEL_COUNT] ?? 0;

  const kapitelList = useMemo(() => Array.from({ length: kapitelCount }, (_, i) => i + 1), [kapitelCount]);

  const handlePress = (kapitel: number): void => {
    if (isB2) {
      // B2 kapitel fan out into 4 modules first, instead of going straight to words.
      router.push(`/glossar/b2/${kapitel}`);
    } else {
      router.push(`/glossar/${level}/${kapitel}`);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title={level} right={<ThemeToggle />} />
        {kapitelList.map((kapitel) => (
          <KapitelRow key={kapitel} level={level} kapitel={kapitel} isB2={isB2} onPress={() => handlePress(kapitel)} />
        ))}
      </ScrollView>
    </View>
  );
}

function KapitelRow({
  level,
  kapitel,
  isB2,
  onPress,
}: {
  level: string;
  kapitel: number;
  isB2: boolean;
  onPress: () => void;
}): React.JSX.Element {
  const { colors } = useTheme();
  const wordCount = isB2 ? null : getGlossarKapitelWords(level, kapitel).length;
  const title = getGlossarKapitelTitle(level, kapitel);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={styles.rowTextGroup}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>Kapitel {kapitel}</Text>
        {title ? (
          <Text style={[styles.rowSubtitle, { color: colors.textMuted }]} numberOfLines={1}>
            {title}
          </Text>
        ) : null}
      </View>
      <Text style={[styles.rowCount, { color: colors.textMuted }]}>
        {isB2 ? "4 modules" : `${wordCount} ${wordCount === 1 ? "word" : "words"}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowTextGroup: { flex: 1, marginRight: 12 },
  rowTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
  rowSubtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 2 },
  rowCount: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs },
});
