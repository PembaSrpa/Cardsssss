import React, { useMemo } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";

export type ScalesVariant = "spacious" | "compact" | "large";

const WIDTH_BY_VARIANT: Record<ScalesVariant, number> = {
  spacious: 24,
  compact: 16,
  large: 36,
};

const STRIPE_GAP = 8;
const STRIPE_THICKNESS = 1;
const STRIPE_LENGTH = 40;

interface StripedEdgeProps {
  thickness: number;
  color: string;
  borderColor: string;
  orientation: "vertical" | "horizontal";
  borderSide: "left" | "right" | "top" | "bottom";
}

function StripedEdge({ thickness, color, borderColor, orientation, borderSide }: StripedEdgeProps): React.JSX.Element {
  const window = useWindowDimensions();
  const length = orientation === "vertical" ? window.height : window.width;

  const stripeCount = Math.ceil((length + STRIPE_LENGTH) / STRIPE_GAP);
  const offsets = useMemo(
    () => Array.from({ length: stripeCount }, (_, i) => i * STRIPE_GAP - STRIPE_LENGTH / 2),
    [stripeCount]
  );

  const borderStyle = {
    borderLeftWidth: borderSide === "right" ? StyleSheet.hairlineWidth * 2 : 0,
    borderRightWidth: borderSide === "left" ? StyleSheet.hairlineWidth * 2 : 0,
    borderTopWidth: borderSide === "bottom" ? StyleSheet.hairlineWidth * 2 : 0,
    borderBottomWidth: borderSide === "top" ? StyleSheet.hairlineWidth * 2 : 0,
    borderColor,
  };

  return (
    <View
      pointerEvents="none"
      style={[
        styles.edgeBase,
        borderStyle,
        orientation === "vertical" ? { width: thickness, height: length } : { width: length, height: thickness },
      ]}
    >
      {offsets.map((offset) => (
        <View
          key={offset}
          style={[
            styles.stripe,
            {
              backgroundColor: color,
              width: STRIPE_LENGTH,
              height: STRIPE_THICKNESS,
              top: orientation === "vertical" ? offset : thickness / 2,
              left: orientation === "vertical" ? -STRIPE_LENGTH / 2 + thickness / 2 : offset,
              transform: [{ rotate: "45deg" }],
            },
          ]}
        />
      ))}
    </View>
  );
}

interface ScalesProps {
  variant?: ScalesVariant;
  edges?: Array<"left" | "right" | "bottom">;
}

export function Scales({ variant = "compact", edges = ["left", "right"] }: ScalesProps = {}): React.JSX.Element {
  const { colors } = useTheme();
  const thickness = WIDTH_BY_VARIANT[variant];

  return (
    <>
      {edges.includes("left") && (
        <View style={[styles.posLeft, { width: thickness }]}>
          <StripedEdge
            thickness={thickness}
            color={colors.border}
            borderColor={colors.border}
            orientation="vertical"
            borderSide="right"
          />
        </View>
      )}
      {edges.includes("right") && (
        <View style={[styles.posRight, { width: thickness }]}>
          <StripedEdge
            thickness={thickness}
            color={colors.border}
            borderColor={colors.border}
            orientation="vertical"
            borderSide="left"
          />
        </View>
      )}
      {edges.includes("bottom") && (
        <View style={[styles.posBottom, { height: thickness }]}>
          <StripedEdge
            thickness={thickness}
            color={colors.border}
            borderColor={colors.border}
            orientation="horizontal"
            borderSide="top"
          />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  posLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  posRight: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
  },
  posBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  edgeBase: {
    overflow: "hidden",
  },
  stripe: {
    position: "absolute",
  },
});
