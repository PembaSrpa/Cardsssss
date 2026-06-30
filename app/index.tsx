import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ThemeToggle } from "../components/ThemeToggle";
import { useNotifications } from "../hooks/useNotifications";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

export default function HomeScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const {
    notificationsEnabled,
    notificationsSupported,
    enableNotifications,
    disableNotifications,
    isLoading,
  } = useNotifications();

  const handleToggleNotifications = async (): Promise<void> => {
    if (!notificationsSupported) {
      return;
    }
    if (notificationsEnabled) {
      await disableNotifications();
    } else {
      await enableNotifications();
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Cards</Text>
          <View style={styles.headerControls}>
            <Pressable
              onPress={handleToggleNotifications}
              disabled={isLoading || !notificationsSupported}
              style={[
                styles.notifToggle,
                {
                  borderColor: colors.border,
                  backgroundColor: notificationsEnabled
                    ? colors.accent
                    : colors.backgroundAlt,
                  opacity: notificationsSupported ? 1 : 0.4,
                },
              ]}
            >
              <Text
                style={[
                  styles.notifIcon,
                  {
                    color: notificationsEnabled
                      ? colors.backgroundAlt
                      : colors.text,
                  },
                ]}
              >
                {notificationsEnabled ? "🔔" : "🔕"}
              </Text>
            </Pressable>
            <ThemeToggle />
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          choose a module to study
        </Text>
        {!notificationsSupported && (
          <Text style={[styles.notifHint, { color: colors.textMuted }]}>
            reminders need a dev build — unavailable in Expo Go
          </Text>
        )}

        <Pressable
          onPress={() => router.push("/ielts")}
          style={({ pressed }) => [
            styles.moduleCard,
            {
              borderColor: colors.border,
              backgroundColor: colors.backgroundAlt,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.moduleLabel, { color: colors.textMuted }]}>
            MODULE 01
          </Text>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>
            IELTS Vocabulary
          </Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
            flashcards across 23 sections
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/german")}
          style={({ pressed }) => [
            styles.moduleCard,
            {
              borderColor: colors.border,
              backgroundColor: colors.backgroundAlt,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.moduleLabel, { color: colors.textMuted }]}>
            MODULE 02
          </Text>
          <Text style={[styles.moduleTitle, { color: colors.text }]}>
            German Artikel
          </Text>
          <Text style={[styles.moduleDesc, { color: colors.textMuted }]}>
            swipe to choose der / die / das
          </Text>
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
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  notifToggle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notifIcon: {
    fontSize: FONT_SIZES.md,
  },
  notifHint: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    marginTop: -20,
    marginBottom: 24,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.xxl,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    marginTop: 6,
    marginBottom: 32,
  },
  moduleCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  moduleLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.5,
  },
  moduleTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
    marginTop: 8,
  },
  moduleDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    marginTop: 6,
  },
});
