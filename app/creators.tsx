import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { NavBar } from "../components/NavBar";
import { Scales } from "../components/Scales";
import { ThemeToggle } from "../components/ThemeToggle";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

interface Creator {
  name: string;
  nickname: string;
  url: string;
}

const CREATORS: Creator[] = [
  {
    name: "Pemba",
    nickname: "arttfolio",
    url: "https://artt-folio.vercel.app",
  },
  {
    name: "Pranay",
    nickname: "frankeinstein",
    url: "https://portfolio-olive-nine-lap0ra8v5x.vercel.app/",
  },
];

interface OtherProject {
  title: string;
  url: string;
}

const OTHER_PROJECTS: OtherProject[] = [
  { title: "Schatten Lesen", url: "https://schatten-lesen.vercel.app/" },
  { title: "Memento Mori", url: "https://memento-mori-jet.vercel.app/" },
  { title: "Want A Resume?", url: "https://want-a-resume.vercel.app/" },
];

export default function CreatorsScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title="View Creators" right={<ThemeToggle />} />

        {CREATORS.map((creator) => (
          <Pressable
            key={creator.name}
            onPress={() => Linking.openURL(creator.url)}
            style={({ pressed }) => [
              styles.creatorCard,
              {
                borderColor: colors.border,
                backgroundColor: colors.backgroundAlt,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.creatorName, { color: colors.text }]}>
              {creator.name}
            </Text>
            <Text style={[styles.creatorNickname, { color: colors.textMuted }]}>
              @{creator.nickname}
            </Text>
          </Pressable>
        ))}

        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          OTHER PROJECTS FROM CREATOR: PEMBA
        </Text>

        {OTHER_PROJECTS.map((project) => (
          <Pressable
            key={project.title}
            onPress={() => Linking.openURL(project.url)}
            style={({ pressed }) => [
              styles.projectRow,
              {
                borderColor: colors.border,
                backgroundColor: colors.backgroundAlt,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Text style={[styles.projectTitle, { color: colors.text }]}>
              {project.title}
            </Text>
            <Ionicons name="open-outline" size={16} color={colors.textMuted} />
          </Pressable>
        ))}

        <Pressable
          onPress={() =>
            Linking.openURL("https://artt-folio.vercel.app/projects")
          }
        >
          <Text style={[styles.note, { color: colors.textMuted }]}>
            See more on ArttFolio →
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  creatorCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  creatorName: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.lg,
  },
  creatorNickname: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.sm,
    marginTop: 4,
  },
  sectionLabel: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.5,
    marginTop: 28,
    marginBottom: 8,
  },
  projectRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  projectTitle: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.md,
  },
  note: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    marginTop: 16,
    textAlign: "center",
  },
});
