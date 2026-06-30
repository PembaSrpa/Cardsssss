import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";
import { FlashCard } from "../../components/FlashCard";
import { AppButton } from "../../components/AppButton";
import { useIELTSData } from "../../hooks/useIELTSData";
import { useProgress } from "../../hooks/useProgress";
import { IELTSWordStatus } from "../../store/progressStore";

type FilterOption = "all" | "hard" | "learning";

const FILTERS: FilterOption[] = ["all", "hard", "learning"];

export default function IELTSFlashcardScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ section: string }>();
  const sectionCode = params.section ?? "";

  const { words, title, isLoading } = useIELTSData(sectionCode);
  const { getWordStatus, setWordStatus } = useProgress();

  const [filter, setFilter] = useState<FilterOption>("all");
  const [index, setIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);

  const filteredWords = useMemo(() => {
    if (filter === "all") {
      return words;
    }
    return words.filter((w) => getWordStatus(w.id) === filter);
  }, [words, filter, getWordStatus]);

  const currentWord = filteredWords[index];

  const goNext = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.min(prev + 1, Math.max(filteredWords.length - 1, 0)));
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

  const handleFilterChange = (next: FilterOption): void => {
    setFilter(next);
    setIndex(0);
    setFlipped(false);
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
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.back, { color: colors.text }]}>← back</Text>
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>{title || sectionCode}</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <AppButton
            key={f}
            label={f}
            active={filter === f}
            onPress={() => handleFilterChange(f)}
            style={styles.filterButton}
          />
        ))}
      </View>

      {currentWord ? (
        <>
          <View style={styles.navRow}>
            <Pressable onPress={goPrev} disabled={index === 0} hitSlop={8}>
              <Text style={[styles.navArrow, { color: index === 0 ? colors.border : colors.text }]}>← prev</Text>
            </Pressable>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
              {index + 1} / {filteredWords.length}
            </Text>
            <Pressable onPress={goNext} disabled={index === filteredWords.length - 1} hitSlop={8}>
              <Text
                style={[
                  styles.navArrow,
                  { color: index === filteredWords.length - 1 ? colors.border : colors.text },
                ]}
              >
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
        <Text style={[styles.empty, { color: colors.textMuted }]}>no cards in this filter</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  loading: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    marginTop: 40,
    textAlign: "center",
  },
  header: {
    marginBottom: 18,
  },
  back: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    marginBottom: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterButton: {
    flex: 1,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navArrow: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
  },
  progressLabel: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    textAlign: "center",
  },
  cardArea: {
    flex: 1,
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 30,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  empty: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.base,
    textAlign: "center",
    marginTop: 60,
  },
});
