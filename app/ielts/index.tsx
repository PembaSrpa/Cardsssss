import React, { useMemo } from "react";
import { View, Text, StyleSheet, Pressable, SectionList } from "react-native";
import { router } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { ProgressBar } from "../../components/ProgressBar";
import { useProgress } from "../../hooks/useProgress";
import { AVAILABLE_IELTS_SECTIONS, useIELTSData } from "../../hooks/useIELTSData";

// Static metadata derived from the known section codes (e.g. "1A" -> parent "1").
interface SectionMeta {
  code: string;
  parent: string;
}

const SECTION_META: SectionMeta[] = AVAILABLE_IELTS_SECTIONS.map((code) => ({
  code,
  parent: code.slice(0, -1),
}));

interface ListSection {
  title: string;
  data: SectionMeta[];
}

export default function IELTSSectionListScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const { ieltsProgress, isLoading } = useProgress();

  const sections = useMemo<ListSection[]>(() => {
    const groups: { [parent: string]: SectionMeta[] } = {};
    SECTION_META.forEach((meta) => {
      if (!groups[meta.parent]) {
        groups[meta.parent] = [];
      }
      groups[meta.parent].push(meta);
    });
    return Object.keys(groups)
      .sort()
      .map((parent) => ({ title: `SECTION ${parent}`, data: groups[parent] }));
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.content}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: colors.textMuted, backgroundColor: colors.background }]}>
            {section.title}
          </Text>
        )}
        ListHeaderComponent={
          <Pressable onPress={() => router.back()} style={styles.backRow}>
            <Text style={[styles.back, { color: colors.text }]}>← back</Text>
          </Pressable>
        }
        renderItem={({ item }) => (
          <SectionRow code={item.code} progressLoaded={!isLoading} ieltsProgress={ieltsProgress} />
        )}
      />
    </View>
  );
}

interface SectionRowProps {
  code: string;
  progressLoaded: boolean;
  ieltsProgress: ReturnType<typeof useProgress>["ieltsProgress"];
}

function SectionRow({ code, ieltsProgress }: SectionRowProps): React.JSX.Element {
  const { colors } = useTheme();
  const { words } = useIELTSData(code);

  const ids = useMemo(() => words.map((w) => w.id), [words]);
  const knownCount = ids.filter((id) => ieltsProgress[id] === "known").length;
  const progressRatio = ids.length > 0 ? knownCount / ids.length : 0;

  return (
    <Pressable
      onPress={() => router.push(`/ielts/${code}`)}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.rowTop}>
        <Text style={[styles.rowCode, { color: colors.text }]}>{code}</Text>
        <Text style={[styles.rowCount, { color: colors.textMuted }]}>{ids.length} words</Text>
      </View>
      <ProgressBar progress={progressRatio} />
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
  backRow: {
    marginBottom: 20,
  },
  back: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.5,
    paddingVertical: 10,
  },
  row: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowCode: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.md,
  },
  rowCount: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
  },
});
