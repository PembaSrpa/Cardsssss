import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Svg, { Line, Rect, ClipPath, Defs } from "react-native-svg";
import { useTheme } from "../theme/ThemeContext";

export type ScalesVariant = "spacious" | "compact";

const WIDTH_BY_VARIANT: Record<ScalesVariant, number> = {
  spacious: 24,
  compact: 16,
};

interface StripedBarProps {
  width: number;
  height: number;
  color: string;
  borderColor: string;
  borderSide: "left" | "right" | "top" | "bottom";
}

function StripedBar({ width, height, color, borderColor, borderSide }: StripedBarProps): React.JSX.Element {
  const lines: React.JSX.Element[] = [];
  const step = 8;
  const span = width + height;
  for (let offset = -height; offset < span; offset += step) {
    lines.push(
      <Line
        key={offset}
        x1={offset}
        y1={0}
        x2={offset + height}
        y2={height}
        stroke={color}
        strokeWidth={1}
      />
    );
  }

  const borderStyle: Record<string, number> = {
    left: borderSide === "right" ? 1 : 0,
    right: borderSide === "left" ? 1 : 0,
    top: borderSide === "bottom" ? 1 : 0,
    bottom: borderSide === "top" ? 1 : 0,
  };

  return (
    <View
      pointerEvents="none"
      style={[
        styles.barBase,
        {
          width,
          height,
          borderLeftWidth: borderStyle.left,
          borderRightWidth: borderStyle.right,
          borderTopWidth: borderStyle.top,
          borderBottomWidth: borderStyle.bottom,
          borderColor,
        },
      ]}
    >
      <Svg width={width} height={height}>
        <Defs>
          <ClipPath id="clip">
            <Rect x={0} y={0} width={width} height={height} />
          </ClipPath>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} clipPath="url(#clip)">
          {lines}
        </Rect>
      </Svg>
    </View>
  );
}

interface ScalesProps {
  variant?: ScalesVariant;
  edges?: Array<"left" | "right" | "bottom">;
}

export function Scales({ variant = "compact", edges = ["left", "right"] }: ScalesProps = {}): React.JSX.Element {
  const { colors } = useTheme();
  const window = Dimensions.get("window");
  const barW = WIDTH_BY_VARIANT[variant];
  const patternColor = colors.border;

  return (
    <>
      {edges.includes("left") && (
        <View style={[styles.edge, { left: 0, top: 0, bottom: 0, width: barW }]}>
          <StripedBar width={barW} height={window.height} color={patternColor} borderColor={colors.border} borderSide="right" />
        </View>
      )}
      {edges.includes("right") && (
        <View style={[styles.edge, { right: 0, top: 0, bottom: 0, width: barW }]}>
          <StripedBar width={barW} height={window.height} color={patternColor} borderColor={colors.border} borderSide="left" />
        </View>
      )}
      {edges.includes("bottom") && (
        <View style={[styles.edgeBottom, { left: 0, right: 0, bottom: 0, height: barW }]}>
          <StripedBar width={window.width} height={barW} color={patternColor} borderColor={colors.border} borderSide="top" />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  barBase: {
    overflow: "hidden",
  },
  edge: {
    position: "absolute",
    zIndex: 10,
  },
  edgeBottom: {
    position: "absolute",
    zIndex: 10,
  },
});
