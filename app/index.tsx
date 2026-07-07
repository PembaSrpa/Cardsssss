import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { ThemeToggle } from "../components/ThemeToggle";
import { Scales } from "../components/Scales";
import { UI_STORAGE_KEYS } from "../store/uiStore";
import { getSectionGroupId } from "../hooks/useIELTSData";

interface LastPosition {
  ieltsSection: string | null;
  ieltsIndex: number;
  germanLevel: string | null;
  germanIndex: number;
  germanScore: number;
  germanStreak: number;
  glossarLevel: string | null;
  glossarKapitel: string | null;
  glossarModule: string | null;
  glossarIndex: number;
}

export default function HomeScreen(): React.JSX.Element {
  const { colors } = useTheme();

  const [lastPos, setLastPos] = useState<LastPosition>({
    ieltsSection: null,
    ieltsIndex: 0,
    germanLevel: null,
    germanIndex: 0,
    germanScore: 0,
    germanStreak: 0,
    glossarLevel: null,
    glossarKapitel: null,
    glossarModule: null,
    glossarIndex: 0,
  });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function loadLastPos(): Promise<void> {
        const [
          ieltsSection,
          ieltsIndexRaw,
          germanLevel,
          germanIndexRaw,
          germanScoreRaw,
          germanStreakRaw,
          glossarLevel,
          glossarKapitel,
          glossarModule,
          glossarIndexRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_IELTS_SECTION),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_IELTS_INDEX),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_SCORE),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_STREAK),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GLOSSAR_LEVEL),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GLOSSAR_KAPITEL),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GLOSSAR_MODULE),
          AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GLOSSAR_INDEX),
        ]);
        if (isMounted) {
          setLastPos({
            ieltsSection,
            ieltsIndex: ieltsIndexRaw ? parseInt(ieltsIndexRaw, 10) : 0,
            germanLevel,
            germanIndex: germanIndexRaw ? parseInt(germanIndexRaw, 10) : 0,
            germanScore: germanScoreRaw ? parseInt(germanScoreRaw, 10) : 0,
            germanStreak: germanStreakRaw ? parseInt(germanStreakRaw, 10) : 0,
            glossarLevel,
            glossarKapitel,
            glossarModule,
            glossarIndex: glossarIndexRaw ? parseInt(glossarIndexRaw, 10) : 0,
          });
        }
      }
      loadLastPos();
      return () => {
        isMounted = false;
      };
    }, [])
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Cards</Text>
          <View style={styles.headerControls}>
            <Pressable
              onPress={() => router.push("/creators")}
              style={[styles.creatorsBtn, { borderColor: colors.border, backgroundColor: colors.backgroundAlt }]}
            >
              <Ionicons name="people-outline" size={18} color={colors.text} />
            </Pressable>
            <ThemeToggle />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODULE 01</Text>
        <Pressable
          onPress={() => router.push("/ielts")}
          style={({ pressed }) => [
            styles.moduleCard,
            { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.moduleTitle, { color: colors.text }]}>IELTS</Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>flashcards</Text>
          <View style={[styles.moduleFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push("/ielts")}
              style={({ pressed }) => [styles.footerBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.footerBtnLabel, { color: colors.text }]}>Browse</Text>
            </Pressable>
            {lastPos.ieltsSection && (
              <Pressable
                onPress={() =>
                  router.push(
                    `/ielts/${getSectionGroupId(lastPos.ieltsSection!)}/${lastPos.ieltsSection}/flashcards?start=${lastPos.ieltsIndex}`
                  )
                }
                style={({ pressed }) => [
                  styles.footerBtn,
                  styles.footerBtnAccent,
                  { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="play-skip-forward-outline" size={13} color={colors.accent} style={styles.footerBtnIcon} />
                <Text style={[styles.footerBtnLabel, { color: colors.accent }]}>
                  Continue {lastPos.ieltsSection}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODULE 02</Text>
        <Pressable
          onPress={() => router.push("/german")}
          style={({ pressed }) => [
            styles.moduleCard,
            { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Deutsch Artikel</Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>swipecards</Text>
          <View style={[styles.moduleFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push("/german")}
              style={({ pressed }) => [styles.footerBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.footerBtnLabel, { color: colors.text }]}>Choose</Text>
            </Pressable>
            {lastPos.germanLevel && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/german/[level]",
                    params: {
                      level: lastPos.germanLevel!,
                      resumeIndex: String(lastPos.germanIndex),
                      resumeScore: String(lastPos.germanScore),
                      resumeStreak: String(lastPos.germanStreak),
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.footerBtn,
                  styles.footerBtnAccent,
                  { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="play-skip-forward-outline" size={13} color={colors.accent} style={styles.footerBtnIcon} />
                <Text style={[styles.footerBtnLabel, { color: colors.accent }]}>
                  Continue {lastPos.germanLevel}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODULE 03</Text>
        <Pressable
          onPress={() => router.push("/glossar")}
          style={({ pressed }) => [
            styles.moduleCard,
            { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.moduleTitle, { color: colors.text }]}>Deutsch Glossaries</Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>flashcards</Text>
          <View style={[styles.moduleFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push("/glossar")}
              style={({ pressed }) => [styles.footerBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.footerBtnLabel, { color: colors.text }]}>Browse</Text>
            </Pressable>
            {lastPos.glossarLevel && lastPos.glossarKapitel && (
              <Pressable
                onPress={() =>
                  router.push(
                    lastPos.glossarModule
                      ? `/glossar/b2/${lastPos.glossarKapitel}/${lastPos.glossarModule}/flashcards?start=${lastPos.glossarIndex}`
                      : `/glossar/${lastPos.glossarLevel}/${lastPos.glossarKapitel}/flashcards?start=${lastPos.glossarIndex}`
                  )
                }
                style={({ pressed }) => [
                  styles.footerBtn,
                  styles.footerBtnAccent,
                  { borderColor: colors.accent, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Ionicons name="play-skip-forward-outline" size={13} color={colors.accent} style={styles.footerBtnIcon} />
                <Text style={[styles.footerBtnLabel, { color: colors.accent }]}>
                  Continue {lastPos.glossarLevel} K{lastPos.glossarKapitel}
                </Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 72,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  creatorsBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.5,
    marginTop: 28,
    marginBottom: 8,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  moduleTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  moduleDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 16,
  },
  moduleFooter: {
    flexDirection: "row",
    borderTopWidth: 1,
    padding: 12,
    gap: 8,
  },
  footerBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  footerBtnAccent: {},
  footerBtnIcon: {
    marginRight: 5,
  },
  footerBtnLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
});
