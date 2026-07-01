import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";
import { ThemeToggle } from "../components/ThemeToggle";
import { Scales } from "../components/Scales";
import { useNotifications } from "../hooks/useNotifications";
import { UI_STORAGE_KEYS } from "../store/uiStore";

interface LastPosition {
  ieltsSection: string | null;
  ieltsIndex: number;
  germanLevel: string | null;
  germanIndex: number;
}

export default function HomeScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const { notificationsEnabled, notificationsSupported, enableNotifications, disableNotifications, isLoading } =
    useNotifications();

  const [lastPos, setLastPos] = useState<LastPosition>({
    ieltsSection: null,
    ieltsIndex: 0,
    germanLevel: null,
    germanIndex: 0,
  });

  useEffect(() => {
    let isMounted = true;
    async function loadLastPos(): Promise<void> {
      const [ieltsSection, ieltsIndexRaw, germanLevel, germanIndexRaw] = await Promise.all([
        AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_IELTS_SECTION),
        AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_IELTS_INDEX),
        AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_LEVEL),
        AsyncStorage.getItem(UI_STORAGE_KEYS.LAST_GERMAN_INDEX),
      ]);
      if (isMounted) {
        setLastPos({
          ieltsSection,
          ieltsIndex: ieltsIndexRaw ? parseInt(ieltsIndexRaw, 10) : 0,
          germanLevel,
          germanIndex: germanIndexRaw ? parseInt(germanIndexRaw, 10) : 0,
        });
      }
    }
    loadLastPos();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleNotifications = async (): Promise<void> => {
    if (!notificationsSupported) return;
    if (notificationsEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Cards</Text>
          <View style={styles.headerControls}>
            <Pressable
              onPress={handleToggleNotifications}
              disabled={isLoading || !notificationsSupported}
              style={[
                styles.iconButton,
                {
                  borderColor: notificationsEnabled ? colors.accent : colors.border,
                  backgroundColor: colors.backgroundAlt,
                  opacity: notificationsSupported ? 1 : 0.35,
                },
              ]}
            >
              <Ionicons
                name={notificationsEnabled ? "notifications" : "notifications-off-outline"}
                size={18}
                color={notificationsEnabled ? colors.accent : colors.text}
              />
            </Pressable>
            <ThemeToggle />
          </View>
        </View>

        {!notificationsSupported && (
          <Text style={[styles.notifHint, { color: colors.textMuted }]}>
            reminders require a dev build
          </Text>
        )}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MODULE 01</Text>
        <Pressable
          onPress={() => router.push("/ielts")}
          style={({ pressed }) => [
            styles.moduleCard,
            { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
          ]}
        >
          <Text style={[styles.moduleTitle, { color: colors.text }]}>IELTS Vocabulary</Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>flashcards across 23 sections</Text>
          <View style={[styles.moduleFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push("/ielts")}
              style={({ pressed }) => [styles.footerBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.footerBtnLabel, { color: colors.text }]}>Browse sections</Text>
            </Pressable>
            {lastPos.ieltsSection && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/ielts/[section]",
                    params: { section: lastPos.ieltsSection!, resumeIndex: String(lastPos.ieltsIndex) },
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
          <Text style={[styles.moduleTitle, { color: colors.text }]}>German Artikel</Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>swipe der / die / das</Text>
          <View style={[styles.moduleFooter, { borderTopColor: colors.border }]}>
            <Pressable
              onPress={() => router.push("/german")}
              style={({ pressed }) => [styles.footerBtn, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
            >
              <Text style={[styles.footerBtnLabel, { color: colors.text }]}>Choose level</Text>
            </Pressable>
            {lastPos.germanLevel && (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/german/[level]",
                    params: { level: lastPos.germanLevel!, resumeIndex: String(lastPos.germanIndex) },
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
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifHint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    marginBottom: 8,
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
  footerBtnAccent: {
    // accent border set inline
  },
  footerBtnIcon: {
    marginRight: 5,
  },
  footerBtnLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
});
