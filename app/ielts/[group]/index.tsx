import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavBar } from "../../../components/NavBar";
import { Scales } from "../../../components/Scales";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { IELTS_SECTION_GROUPS, useIELTSData } from "../../../hooks/useIELTSData";
import { isIELTSSpeakingSection, useIELTSSpeakingData } from "../../../hooks/useIELTSSpeakingData";
import { useTheme } from "../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../theme/typography";

export default function IELTSCategoryPickerScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ group: string }>();
  const group = IELTS_SECTION_GROUPS.find((g) => g.id === params.group);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title={group ? `Section ${group.id}` : "Section"} right={<ThemeToggle />} />
        {group?.categories
          .slice()
          .sort((a, b) => a.localeCompare(b))
          .map((code) => (
            <CategoryRow key={code} groupId={group.id} code={code} />
          ))}
      </ScrollView>
    </View>
  );
}

function CategoryRow({ groupId, code }: { groupId: string; code: string }): React.JSX.Element {
  const { colors } = useTheme();
  const isSpeaking = isIELTSSpeakingSection(code);
  const vocabData = useIELTSData(code);
  const speakingData = useIELTSSpeakingData(code);

  const title = isSpeaking ? speakingData.title : vocabData.title;
  const count = isSpeaking ? speakingData.questions.length : vocabData.words.length;
  const unit = isSpeaking
    ? count === 1
      ? "question"
      : "questions"
    : count === 1
      ? "word"
      : "words";

  return (
    <Pressable
      onPress={() => router.push(`/ielts/${groupId}/${code}`)}
      style={({ pressed }) => [
        styles.row,
        { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.rowTitle, { color: colors.text }]} numberOfLines={2}>
        {title || code}
      </Text>
      <Text style={[styles.rowCount, { color: colors.textMuted }]}>
        {count} {unit}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  row: { borderWidth: 1, borderRadius: 12, padding: 16, marginBottom: 12 },
  rowTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md, marginBottom: 6 },
  rowCount: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm },
});