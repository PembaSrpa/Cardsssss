import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { NavBar } from "../../../../components/NavBar";
import { Scales } from "../../../../components/Scales";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { AppButton } from "../../../../components/AppButton";
import { useGlossarKapitel } from "../../../../hooks/useGlossarData";
import { glossarListIndexKey } from "../../../../store/uiStore";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";

export default function GlossarVocabularyListScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ level: string; kapitel: string }>();
  const level = params.level ?? "";
  const kapitel = params.kapitel ? parseInt(params.kapitel, 10) : 1;

  const { words, isLoading } = useGlossarKapitel(level, kapitel);
  const [resumeIndex, setResumeIndex] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      AsyncStorage.getItem(glossarListIndexKey(level, kapitel)).then((raw) => {
        if (!isMounted) return;
        const parsed = raw ? parseInt(raw, 10) : 0;
        setResumeIndex(parsed > 0 ? parsed : null);
      });
      return () => {
        isMounted = false;
      };
    }, [level, kapitel])
  );

  const goToFlashcards = (start: number): void => {
    router.push(`/glossar/${level}/${kapitel}/flashcards?start=${start}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <View style={styles.inner}>
        <NavBar title={`${level} · Kapitel ${kapitel}`} right={<ThemeToggle />} />

        {resumeIndex !== null ? (
          <AppButton
            label={`Continue (${resumeIndex + 1} / ${words.length})`}
            onPress={() => goToFlashcards(resumeIndex)}
            active
            style={styles.startButton}
          />
        ) : (
          <AppButton label="Start Flashcards" onPress={() => goToFlashcards(0)} active style={styles.startButton} />
        )}

        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isLoading ? <Text style={[styles.empty, { color: colors.textMuted }]}>no words found</Text> : null
          }
          renderItem={({ item, index }) => (
            <Pressable
              onPress={() => goToFlashcards(index)}
              style={({ pressed }) => [
                styles.wordRow,
                { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.wordText, { color: colors.text }]} numberOfLines={1}>
                {item.word}
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
  wordText: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.sm },
  wordMeaning: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 3 },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center", marginTop: 40 },
});
