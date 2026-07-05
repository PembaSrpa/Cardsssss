import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavBar } from "../../components/NavBar";
import { Scales } from "../../components/Scales";
import { ThemeToggle } from "../../components/ThemeToggle";
import { IELTS_SECTION_GROUPS } from "../../hooks/useIELTSData";
import { useTheme } from "../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../theme/typography";

export default function IELTSSectionPickerScreen(): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title="IELTS" right={<ThemeToggle />} />
        {IELTS_SECTION_GROUPS.map((group) => (
          <Pressable
            key={group.id}
            onPress={() => router.push(`/ielts/${group.id}`)}
            style={({ pressed }) => [
              styles.card,
              { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.cardLabel, { color: colors.textMuted }]}>SECTION {group.id}</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{group.title}</Text>
            {!!group.subtitle && (
              <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>{group.subtitle}</Text>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 14, padding: 18, marginBottom: 14 },
  cardLabel: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, letterSpacing: 1.5, marginBottom: 6 },
  cardTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
  cardSubtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, marginTop: 4 },
});
