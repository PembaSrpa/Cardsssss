import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { FONTS, FONT_SIZES } from "../theme/typography";

interface NavBarProps {
  title?: string;
  right?: React.ReactNode;
}

export function NavBar({ title, right }: NavBarProps): React.JSX.Element {
  const { colors } = useTheme();

  return (
    <View style={styles.bar}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={16}
        style={[styles.backBtn, { borderColor: colors.border, backgroundColor: colors.backgroundAlt }]}
      >
        <Ionicons name="arrow-back" size={18} color={colors.text} />
      </Pressable>

      {title ? (
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View />
      )}

      <View style={styles.right}>{right ?? <View style={styles.placeholder} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.base,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  right: {
    width: 38,
    alignItems: "flex-end",
  },
  placeholder: {
    width: 38,
  },
});
