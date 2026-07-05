import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from "react-native-reanimated";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";
import { GlossarCard } from "../../../../components/GlossarCard";
import { AppButton } from "../../../../components/AppButton";
import { NavBar } from "../../../../components/NavBar";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { Scales } from "../../../../components/Scales";
import { useGlossarB2Meta, useGlossarB2Module } from "../../../../hooks/useGlossarData";

export default function GlossarB2ModuleScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ kapitel: string; module: string }>();
  const kapitel = params.kapitel ? parseInt(params.kapitel, 10) : 1;
  const moduleId = params.module ?? "m1";

  const { modules } = useGlossarB2Meta(kapitel);
  const title = modules.find((m) => m.id === moduleId)?.title ?? moduleId;

  const { words, isLoading } = useGlossarB2Module(kapitel, moduleId);

  const [index, setIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  const currentWord = words[index];

  const goNext = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.min(prev + 1, words.length - 1));
  };
  const goPrev = (): void => {
    setFlipped(false);
    setIndex((prev) => Math.max(prev - 1, 0));
  };

  const translateX = useSharedValue<number>(0);
  const SWIPE_THRESHOLD = 60;

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-25, 25])
    .onUpdate((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      const { translationX } = event;
      translateX.value = withSpring(0);
      if (translationX < -SWIPE_THRESHOLD) {
        runOnJS(goNext)();
      } else if (translationX > SWIPE_THRESHOLD) {
        runOnJS(goPrev)();
      }
    });

  const swipeCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
        <NavBar title={title} right={<ThemeToggle />} />

        {currentWord ? (
          <>
            <View style={styles.navRow}>
              <Text style={[styles.progressLabel, { color: colors.textMuted }]}>
                {index + 1} / {words.length}
              </Text>
            </View>

            <GestureDetector gesture={swipeGesture}>
              <Animated.View style={[styles.cardArea, swipeCardStyle]}>
                <GlossarCard word={currentWord} flipped={flipped} onPress={() => setFlipped((f) => !f)} />
              </Animated.View>
            </GestureDetector>

            <View style={styles.actionRow}>
              <AppButton label="← prev" onPress={goPrev} disabled={index === 0} style={styles.actionButton} />
              <AppButton
                label="next →"
                onPress={goNext}
                disabled={index === words.length - 1}
                style={styles.actionButton}
              />
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
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  progressLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, textAlign: "center" },
  cardArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  actionRow: { flexDirection: "row", gap: 8, marginBottom: 8, marginTop: 16, width: "100%", maxWidth: 420, alignSelf: "center" },
  actionButton: { flex: 1 },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, textAlign: "center", marginTop: 60 },
});
