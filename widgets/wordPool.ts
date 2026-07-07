// Hook-free word accessors for the home-screen widgets.
//
// The widget task handler runs outside of a React component tree (it's
// invoked by the native widget host, not by app/ screens), so it can't use
// the useIELTSData / useGlossarData hooks. It calls straight into the
// already-exported flat-pool functions instead — same in-memory cache, no
// React involved.

import { getAllIELTSWordsFlat, IELTSWord } from "../hooks/useIELTSData";
import { getAllGlossarWordsFlat, GlossarWord } from "../hooks/useGlossarData";

// Normalized shape both widgets render. IELTS words don't have a "plural",
// Glossar words don't have "type"/"category" — front/back covers both.
export interface WidgetCard {
  id: string;
  front: string;
  subtitle?: string; // word type (IELTS) or plural (Glossar)
  back: string; // meaning
  example?: string;
}

function ieltsToCard(w: IELTSWord): WidgetCard {
  return {
    id: w.id,
    front: w.word,
    subtitle: w.type,
    back: w.meaning,
    example: w.example,
  };
}

function glossarToCard(w: GlossarWord): WidgetCard {
  return {
    id: w.id,
    front: w.word,
    subtitle: w.plural,
    back: w.meaning,
    example: w.example,
  };
}

export function getRandomIELTSCard(excludeId?: string): WidgetCard | null {
  const words = getAllIELTSWordsFlat();
  return pickRandom(words.map(ieltsToCard), excludeId);
}

export function getRandomGlossarCard(excludeId?: string): WidgetCard | null {
  const words = getAllGlossarWordsFlat();
  return pickRandom(words.map(glossarToCard), excludeId);
}

// Prev/next just walk the flat pool in order relative to a known id, so the
// widget's two buttons feel stable instead of re-randomizing on every tap.
export function getIELTSCardBy(offset: number, currentId?: string): WidgetCard | null {
  return stepPool(getAllIELTSWordsFlat().map(ieltsToCard), offset, currentId);
}

export function getGlossarCardBy(offset: number, currentId?: string): WidgetCard | null {
  return stepPool(getAllGlossarWordsFlat().map(glossarToCard), offset, currentId);
}

function pickRandom(cards: WidgetCard[], excludeId?: string): WidgetCard | null {
  if (cards.length === 0) return null;
  if (cards.length === 1) return cards[0];

  let card = cards[Math.floor(Math.random() * cards.length)];
  // Avoid landing on the exact same word twice in a row when we can help it.
  let attempts = 0;
  while (card.id === excludeId && attempts < 5) {
    card = cards[Math.floor(Math.random() * cards.length)];
    attempts++;
  }
  return card;
}

function stepPool(cards: WidgetCard[], offset: number, currentId?: string): WidgetCard | null {
  if (cards.length === 0) return null;
  const currentIndex = currentId ? cards.findIndex((c) => c.id === currentId) : -1;
  const baseIndex = currentIndex === -1 ? 0 : currentIndex;
  const nextIndex = ((baseIndex + offset) % cards.length + cards.length) % cards.length;
  return cards[nextIndex];
}
