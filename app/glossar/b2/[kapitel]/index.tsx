import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NavBar } from "../../../../components/NavBar";
import { Scales } from "../../../../components/Scales";
import { ThemeToggle } from "../../../../components/ThemeToggle";
import { useGlossarB2Meta } from "../../../../hooks/useGlossarData";
import { useTheme } from "../../../../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../../../../theme/typography";

export default function GlossarB2ModuleListScreen(): React.JSX.Element {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ kapitel: string }>();
  const kapitel = params.kapitel ? parseInt(params.kapitel, 10) : 1;

  const { modules, isLoading } = useGlossarB2Meta(kapitel);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Scales variant="compact" edges={["left", "right"]} />
      <ScrollView contentContainerStyle={styles.content}>
        <NavBar title={`B2 · Kapitel ${kapitel}`} right={<ThemeToggle />} />
        {isLoading ? (
          <Text style={[styles.loading, { color: colors.textMuted }]}>loading…</Text>
        ) : (
          modules.map((mod) => (
            <Pressable
              key={mod.id}
              onPress={() => router.push(`/glossar/b2/${kapitel}/${mod.id}`)}
              style={({ pressed }) => [
                styles.card,
                { borderColor: colors.border, backgroundColor: colors.backgroundAlt, opacity: pressed ? 0.75 : 1 },
              ]}
            >
              <Text style={[styles.title, { color: colors.text }]}>{mod.title}</Text>
              <Text style={[styles.type, { color: colors.textMuted }]}>flashcards</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 32, paddingTop: 56, paddingBottom: 40 },
  loading: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.base, marginTop: 40, textAlign: "center" },
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md },
  type: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, letterSpacing: 0.5 },
});
