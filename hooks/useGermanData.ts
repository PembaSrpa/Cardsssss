import { useEffect, useState } from "react";

export type GermanArtikel = "der" | "die" | "das";

export interface GermanWord {
  id: string;
  word: string;
  artikel: GermanArtikel;
  meaning: string;
}

export interface GermanLevelData {
  level: string;
  words: GermanWord[];
}

export interface UseGermanDataResult {
  words: GermanWord[];
  level: string;
  isLoading: boolean;
}

const GERMAN_DATA_MAP: { [key: string]: () => GermanLevelData } = {
  A1: () => require("../assets/data/german_A1.json"),
  A2: () => require("../assets/data/german_A2.json"),
  B1: () => require("../assets/data/german_B1.json"),
};

export const AVAILABLE_GERMAN_LEVELS: string[] = Object.keys(GERMAN_DATA_MAP);

const levelCache: { [key: string]: GermanLevelData } = {};

function loadLevel(level: string): GermanLevelData | null {
  if (levelCache[level]) {
    return levelCache[level];
  }

  const loader = GERMAN_DATA_MAP[level];
  if (!loader) {
    return null;
  }

  const data = loader();
  levelCache[level] = data;
  return data;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export function getGermanLevelWords(level: string): GermanWord[] {
  const data = loadLevel(level);
  return data?.words ?? [];
}

export function shuffleGermanWords<T>(items: T[]): T[] {
  return shuffle(items);
}

export function useGermanData(level: string): UseGermanDataResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [words, setWords] = useState<GermanWord[]>([]);
  const [resolvedLevel, setResolvedLevel] = useState<string>(level);

  useEffect(() => {
    setIsLoading(true);
    const data = loadLevel(level);
    const allWords = data?.words ?? [];
    setWords(shuffle(allWords));
    setResolvedLevel(data?.level ?? level);
    setIsLoading(false);
    // Re-shuffle every time the level changes, producing a new session order.
  }, [level]);

  return {
    words,
    level: resolvedLevel,
    isLoading,
  };
}
