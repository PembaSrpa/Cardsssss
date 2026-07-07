
import { getAllIELTSWordsFlat, IELTSWord } from "../hooks/useIELTSData";
import { getAllGlossarWordsFlat, GlossarWord } from "../hooks/useGlossarData";

export interface WidgetCard {
  id: string;
  front: string;
  subtitle?: string;
  back: string;
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
