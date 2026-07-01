import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { FlashCard } from "../../components/FlashCard";
import { AppButton } from "../../components/AppButton";
import { NavBar } from "../../components/NavBar";
import { ThemeToggle } from "../../components/ThemeToggle";
import { Scales } from "../../components/Scales";
import { useIELTSData } from "../../hooks/useIELTSData";
import { useProgress } from "../../hooks/useProgress";
import { IELTSWordStatus } from "../../store/progressStore";
import { UI_STORAGE_KEYS } from "../../store/uiStore";

export default function IELTSFlashcardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ section: string; resumeIndex?: string }>();
  const sectionCode = params.section ?? "";
  const resumeIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;

  const { words, title, isLoading } = useIELTSData(sectionCode);
  const { setWordStatus } = useProgress();

  const [index, setIndex] = useState<number>(resumeIndex);
  const [flipped, setFlipped] = useState<boolean>(false);

  useEffect(() => {
    if (!sectionCode) return;
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_SECTION, sectionCode);
    AsyncStorage.setItem(UI_STORAGE_KEYS.LAST_IELTS_INDEX, String(index));
  }, [sectionCode, index]);

  const currentWord = words[index];

  const goNext = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.min(prev + 1, words.length - 1));
  };

  const goPrev = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleStatus = async (status: IELTSWordStatus): Promise<void> => {
    if (!currentWord) return;
    await setWordStatus(currentWord.id, status);
    goNext();
  };

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <View style={styles.inner}>
        <NavBar title={title || sectionCode} right={<ThemeToggle />} />

        {currentWord ? (
          <>
            <View style={styles.navRow}>
              <Pressable onPress={goPrev} disabled={index === 0} hitSlop={12}>
                <Text style={[styles.navArrow, { color: index === 0 ? colors.border : colors.text }]}>← prev</Text>
              </Pressable>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {index + 1} / {words.length}
              </Text>
              <Pressable onPress={goNext} disabled={index === words.length - 1} hitSlop={12}>
                <Text style={[styles.navArrow, { color: index === words.length - 1 ? colors.border : colors.text }]}>
                  next →
                </Text>
              </Pressable>
            </View>

            <View style={styles.cardArea}>
              <FlashCard word={currentWord} flipped={flipped} onPress={() => setFlipped((f) => !f)} />
            </View>

            <View style={styles.actionRow}>
              <AppButton label="hard" onPress={() => handleStatus("hard")} style={styles.actionButton} />
              <AppButton label="learning" onPress={() => handleStatus("learning")} style={styles.actionButton} />
              <AppButton label="known" onPress={() => handleStatus("known")} style={styles.actionButton} />
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>no cards found</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 24 },
  loading: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, marginTop: 40, textAlign: "center" },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  navArrow: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm },
  progressLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, textAlign: "center" },
  cardArea: { flex: 1, justifyContent: "center" },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 8, marginTop: 16 },
  actionButton: { flex: 1 },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center", marginTop: 60 },
});
