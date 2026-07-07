import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { FlashcardWidget, WidgetModule } from "./FlashcardWidget";
import {
  getRandomIELTSCard,
  getRandomGlossarCard,
  getIELTSCardBy,
  getGlossarCardBy,
  WidgetCard,
} from "./wordPool";

const WIDGET_NAME_IELTS = "IELTSFlashcard";
const WIDGET_NAME_GLOSSAR = "GlossarFlashcard";

interface WidgetState {
  wordId: string;
  revealed: boolean;
}

function stateKey(widgetId: number): string {
  return `cards_widget_state_${widgetId}`;
}

async function loadState(widgetId: number): Promise<WidgetState | null> {
  const raw = await AsyncStorage.getItem(stateKey(widgetId));
  return raw ? (JSON.parse(raw) as WidgetState) : null;
}

async function saveState(widgetId: number, state: WidgetState): Promise<void> {
  await AsyncStorage.setItem(stateKey(widgetId), JSON.stringify(state));
}

function moduleForWidgetName(widgetName: string): WidgetModule {
  return widgetName === WIDGET_NAME_GLOSSAR ? "glossar" : "ielts";
}

function randomCardFor(module: WidgetModule, excludeId?: string): WidgetCard | null {
  return module === "glossar" ? getRandomGlossarCard(excludeId) : getRandomIELTSCard(excludeId);
}

function cardByOffsetFor(module: WidgetModule, offset: number, currentId?: string): WidgetCard | null {
  return module === "glossar"
    ? getGlossarCardBy(offset, currentId)
    : getIELTSCardBy(offset, currentId);
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const widgetId = widgetInfo.widgetId;
  const module = moduleForWidgetName(widgetInfo.widgetName);

  switch (props.widgetAction) {
    case "WIDGET_ADDED": {
      const card = randomCardFor(module);
      const state: WidgetState = { wordId: card?.id ?? "", revealed: false };
      await saveState(widgetId, state);
      props.renderWidget(
        <FlashcardWidget module={module} card={card} revealed={false} widgetId={widgetId} />
      );
      break;
    }

    case "WIDGET_UPDATE": {
      const existing = await loadState(widgetId);
      const card = randomCardFor(module, existing?.wordId);
      const state: WidgetState = { wordId: card?.id ?? "", revealed: false };
      await saveState(widgetId, state);
      props.renderWidget(
        <FlashcardWidget module={module} card={card} revealed={false} widgetId={widgetId} />
      );
      break;
    }

    case "WIDGET_RESIZED": {
      const existing = await loadState(widgetId);
      const card = existing?.wordId
        ? cardByOffsetFor(module, 0, existing.wordId) ?? randomCardFor(module)
        : randomCardFor(module);
      props.renderWidget(
        <FlashcardWidget
          module={module}
          card={card}
          revealed={existing?.revealed ?? false}
          widgetId={widgetId}
        />
      );
      break;
    }

    case "WIDGET_DELETED": {
      await AsyncStorage.removeItem(stateKey(widgetId));
      break;
    }

    case "WIDGET_CLICK": {
      const data = (props.clickActionData ?? {}) as { widgetId?: number; wordId?: string };
      const existing = await loadState(widgetId);

      if (props.clickAction === "TOGGLE_REVEAL") {
        const revealed = !(existing?.revealed ?? false);
        const wordId = existing?.wordId ?? data.wordId ?? "";
        const card = wordId ? cardByOffsetFor(module, 0, wordId) : randomCardFor(module);
        await saveState(widgetId, { wordId: card?.id ?? wordId, revealed });
        props.renderWidget(
          <FlashcardWidget module={module} card={card} revealed={revealed} widgetId={widgetId} />
        );
        break;
      }

      if (props.clickAction === "NEXT_CARD" || props.clickAction === "PREV_CARD") {
        const offset = props.clickAction === "NEXT_CARD" ? 1 : -1;
        const card = cardByOffsetFor(module, offset, existing?.wordId);
        await saveState(widgetId, { wordId: card?.id ?? "", revealed: false });
        props.renderWidget(
          <FlashcardWidget module={module} card={card} revealed={false} widgetId={widgetId} />
        );
        break;
      }

      break;
    }

    default:
      break;
  }
}
