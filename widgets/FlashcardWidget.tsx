import React from "react";
import { FlexWidget, TextWidget, SvgWidget } from "react-native-android-widget";
import type { WidgetCard } from "./wordPool";

const ACCENT = "#3D7BFF";
const BG = "#101418";
const CARD_BG = "#1B2129";
const TEXT = "#F5F7FA";
const MUTED = "#8B94A3";

export type WidgetModule = "ielts" | "glossar";

export interface FlashcardWidgetProps {
  module: WidgetModule;
  card: WidgetCard | null;
  revealed: boolean;
  widgetId: number;
}

const CHEVRON_LEFT =
  '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M15 6l-6 6 6 6" stroke="#F5F7FA" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHEVRON_RIGHT =
  '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M9 6l6 6-6 6" stroke="#F5F7FA" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

export function FlashcardWidget(props: FlashcardWidgetProps) {
  const { module, card, revealed, widgetId } = props;
  const label = module === "ielts" ? "IELTS" : "Glossar";

  if (!card) {
    return (
      <FlexWidget
        style={{
          height: "match_parent",
          width: "match_parent",
          backgroundColor: BG,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
        clickAction="OPEN_APP"
      >
        <TextWidget text="No words loaded" style={{ fontSize: 14, color: MUTED }} />
      </FlexWidget>
    );
  }

  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: BG,
        borderRadius: 20,
        padding: 12,
        flexDirection: "column",
      }}
    >
      {}
      <FlexWidget
        style={{
          width: "match_parent",
          height: 22,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        clickAction="OPEN_APP"
      >
        <TextWidget
          text={label.toUpperCase()}
          style={{ fontSize: 11, color: ACCENT, fontWeight: "600", letterSpacing: 1 }}
        />
      </FlexWidget>

      {}
      <FlexWidget
        style={{
          flex: 1,
          width: "match_parent",
          backgroundColor: CARD_BG,
          borderRadius: 16,
          marginTop: 6,
          marginBottom: 8,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
        clickAction="TOGGLE_REVEAL"
        clickActionData={{ widgetId, wordId: card.id }}
      >
        {!revealed ? (
          <FlexWidget style={{ flexDirection: "column", alignItems: "center" }}>
            <TextWidget
              text={card.front}
              style={{ fontSize: 26, fontWeight: "700", color: TEXT }}
              maxLines={2}
            />
            {!!card.subtitle && (
              <TextWidget
                text={card.subtitle}
                style={{ fontSize: 13, color: MUTED, marginTop: 4 }}
              />
            )}
          </FlexWidget>
        ) : (
          <FlexWidget style={{ flexDirection: "column", alignItems: "center", padding: 8 }}>
            <TextWidget
              text={card.back}
              style={{ fontSize: 18, fontWeight: "600", color: TEXT, textAlign: "center" }}
              maxLines={3}
            />
            {!!card.example && (
              <TextWidget
                text={card.example}
                style={{
                  fontSize: 12,
                  color: MUTED,
                  textAlign: "center",
                  marginTop: 6,
                  fontStyle: "italic",
                }}
                maxLines={2}
              />
            )}
          </FlexWidget>
        )}
      </FlexWidget>

      {}
      <FlexWidget
        style={{
          width: "match_parent",
          height: 36,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FlexWidget
          style={{
            width: 48,
            height: 32,
            borderRadius: 10,
            backgroundColor: CARD_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
          clickAction="PREV_CARD"
          clickActionData={{ widgetId, module }}
        >
          <SvgWidget svg={CHEVRON_LEFT} style={{ width: 20, height: 20 }} />
        </FlexWidget>

        <TextWidget text="tap card to flip" style={{ fontSize: 10, color: MUTED }} />

        <FlexWidget
          style={{
            width: 48,
            height: 32,
            borderRadius: 10,
            backgroundColor: CARD_BG,
            justifyContent: "center",
            alignItems: "center",
          }}
          clickAction="NEXT_CARD"
          clickActionData={{ widgetId, module }}
        >
          <SvgWidget svg={CHEVRON_RIGHT} style={{ width: 20, height: 20 }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
