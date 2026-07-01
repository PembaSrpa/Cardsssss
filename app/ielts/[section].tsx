import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppButton } from "../../components/AppButton";
import { FlashCard } from "../../components/FlashCard";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useIELTSData } from "../../hooks/useIELTSData";
import { UI_STORAGE_KEYS } from "../../store/uiStore";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";

export default function IELTSFlashcardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{
    section: string;
    resumeIndex?: string;
  }>();
  const sectionCode = params.section ?? "";
  const resumeIndex = params.resumeIndex ? parseInt(params.resumeIndex, 10) : 0;

  const { words, title, isLoading } = useIELTSData(sectionCode);

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

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.loading, { color: colors.textMuted }]}>
          loading…
        </Text>
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
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {index + 1} / {words.length}
              </Text>
            </View>

            <View style={styles.cardArea}>
              <FlashCard
                word={currentWord}
                flipped={flipped}
                onPress={() => setFlipped((f) => !f)}
              />
            </View>

            <View style={styles.actionRow}>
              <AppButton
                label="← prev"
                onPress={goPrev}
                disabled={index === 0}
                style={styles.actionButton}
              />
              <AppButton
                label="next →"
                onPress={goNext}
                disabled={index === words.length - 1}
                style={styles.actionButton}
              />
            </View>
          </>
        ) : (
          <Text style={[styles.empty, { color: colors.textMuted }]}>
            no cards found
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 32, paddingTop: 56, paddingBottom: 24 },
  loading: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    marginTop: 40,
    textAlign: "center",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: "center",
  },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    marginTop: 16,
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
  },
  actionButton: { flex: 1 },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
    marginTop: 60,
  },
});
