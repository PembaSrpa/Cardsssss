import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { NavBar } from "../../../../components/NavBar";
import { Scales } from "../../../../components/Scales";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { AppButton } from "../../../../components/AppButton";
import { useIELTSData } from "../../../../hooks/useIELTSData";
import { isIELTSSpeakingSection, useIELTSSpeakingData } from "../../../../hooks/useIELTSSpeakingData";
import { ieltsListIndexKey } from "../../../../store/uiStore";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";

export default function IELTSVocabularyListScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ group: string; section: string }>();
  const group = params.group ?? "1";
  const section = params.section ?? "";

  const isSpeaking = isIELTSSpeakingSection(section);
  const vocabData = useIELTSData(section);
  const speakingData = useIELTSSpeakingData(section);

  const title = isSpeaking ? speakingData.title : vocabData.title;
  const isLoading = isSpeaking ? speakingData.isLoading : vocabData.isLoading;
  const itemCount = isSpeaking ? speakingData.questions.length : vocabData.words.length;

  const [resumeIndex, setResumeIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      AsyncStorage.getItem(ieltsListIndexKey(section)).then((raw) => {
        if (!isMounted) return;
        const parsed = raw ? parseInt(raw, 10) : 0;
        setResumeIndex(parsed > 0 ? parsed : null);
      });
      return () => {
        isMounted = false;
      };
    }, [section])
  );

  const goToFlashcards = (start: number): void => {
    router.push(`/ielts/${group}/${section}/flashcards?start=${start}`);
  };

  const rows = isSpeaking
    ? speakingData.questions.map((q) => ({
        id: q.id,
        label: q.question,
        badge: q.part === 2 ? "PART 2" : `PART ${q.part}`,
      }))
    : vocabData.words.map((w) => ({ id: w.id, label: w.word, badge: undefined as string | undefined }));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <View style={styles.inner}>
        <NavBar title={title || section} right={<ThemeToggle />} />

        {resumeIndex !== null ? (
          <AppButton
            label={`Continue (${resumeIndex + 1} / ${itemCount})`}
            onPress={() => goToFlashcards(resumeIndex)}
            active
            style={styles.startButton}
          />
        ) : (
          <AppButton label="Start Flashcards" onPress={() => goToFlashcards(0)} active style={styles.startButton} />
        )}

        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isLoading ? (
              <Text style={[styles.empty, { color: colors.textMuted }]}>
                {isSpeaking ? "no questions found" : "no words found"}
              </Text>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => goToFlashcards(index)}
              style={({ pressed }) => [
                styles.wordRow,
                { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              {!!item.badge && (
                <Text style={[styles.badge, { color: colors.textMuted }]}>{item.badge}</Text>
              )}
              <Text
                style={[styles.wordText, { color: colors.text }]}
                numberOfLines={isSpeaking ? 2 : 1}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 56 },
  startButton: { marginTop: 8, marginBottom: 16, paddingVertical: 22 },
  listContent: { paddingBottom: 40 },
  wordRow: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 10 },
  badge: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, letterSpacing: 1, marginBottom: 4 },
  wordText: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm },
  wordMeaning: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 3 },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center", marginTop: 40 },
});
