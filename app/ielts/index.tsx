import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import {
  AVAILABLE_IELTS_SECTIONS,
  useIELTSData,
} from "../../hooks/useIELTSData";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { UI_STORAGE_KEYS } from "../../store/uiStore";

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

  const sections = useMemo<ListSection[]>(() => {
    const groups: { [parent: string]: SectionMeta[] } = {};
    SECTION_META.forEach((meta) => {
      if (!groups[meta.parent]) groups[meta.parent] = [];
      groups[meta.parent].push(meta);
    });
    return Object.keys(groups)
      .sort()
      .map((parent) => ({ title: `SECTION ${parent}`, data: groups[parent] }));
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.content}
        renderSectionHeader={({ section }) => (
          <Text
            style={[
              styles.sectionHeader,
              { color: colors.textMuted, backgroundColor: colors.background },
            ]}
          >
            {section.title}
          </Text>
        )}
        ListHeaderComponent={
          <NavBar title="IELTS" right={<ThemeToggle />} />
        }
        renderItem={({ item }) => <SectionRow code={item.code} />}
      />
    </View>
  );
}

interface SectionRowProps {
  code: string;
}

function SectionRow({ code }: SectionRowProps): React.JSX.Element {
  const { colors } = useTheme();
  const { words, title } = useIELTSData(code);

  const handlePress = async (): Promise<void> => {
    // Write this immediately — don't wait for the destination screen to sync
    // it up, so "Continue" reflects the section you just picked right away.
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_SECTION, code);
    await AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_INDEX, "0");
    router.push(`/ielts/${code}`);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.row,
        {
          borderColor: colors.border,
          backgroundColor: colors.backgroundAlt,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
        {title || code}
      </Text>
      <Text style={[styles.rowCount, { color: colors.textMuted }]}>
        {words.length} {words.length === 1 ? "word" : "words"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  sectionHeader: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.5,
    paddingVertical: 10,
  },
  row: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  rowTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md, marginBottom: 6 },
  rowCount: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm },
});
