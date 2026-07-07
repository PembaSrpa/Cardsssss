import { useEffect, useState } from "react";

// Deutsch Glossaries: Level (A1/A2/B1/B2) -> Kapitel -> word list.
// A1/A2/B1 kapitel go straight to a flashcard list. B2 kapitel are unique —
// each one fans out into 4 modules first (see GlossarB2Module), and each
// module has its own word list, loaded on demand.

export interface GlossarWord {
  id: string;
  word: string;
  plural?: string;
  meaning: string;
  example?: string;
}

export interface GlossarKapitelData {
  level: string;
  kapitel: number;
  moduleId?: string;
  words: GlossarWord[];
}

export const GLOSSAR_LEVELS = ["A1", "A2", "B1", "B2"] as const;
export type GlossarLevel = (typeof GLOSSAR_LEVELS)[number];

// A1/A2/B1 run Kapitel 1–12. B2 runs Kapitel 1–10 but routes through a
// module picker instead of straight to words — see useGlossarB2Meta below.
export const GLOSSAR_KAPITEL_COUNT: Record<GlossarLevel, number> = {
  A1: 12,
  A2: 12,
  B1: 12,
  B2: 10,
};

export function isB2Level(level: string): boolean {
  return level === "B2";
}

// ---- A1 / A2 / B1 straight kapitel word lists ----

const GLOSSAR_DATA_MAP: { [key: string]: () => GlossarKapitelData } = {
  A1_K1: () => require("../assets/data/glossar_A1_K1.json"),
  A1_K2: () => require("../assets/data/glossar_A1_K2.json"),
  A1_K3: () => require("../assets/data/glossar_A1_K3.json"),
  A1_K4: () => require("../assets/data/glossar_A1_K4.json"),
  A1_K5: () => require("../assets/data/glossar_A1_K5.json"),
  A1_K6: () => require("../assets/data/glossar_A1_K6.json"),
  A1_K7: () => require("../assets/data/glossar_A1_K7.json"),
  A1_K8: () => require("../assets/data/glossar_A1_K8.json"),
  A1_K9: () => require("../assets/data/glossar_A1_K9.json"),
  A1_K10: () => require("../assets/data/glossar_A1_K10.json"),
  A1_K11: () => require("../assets/data/glossar_A1_K11.json"),
  A1_K12: () => require("../assets/data/glossar_A1_K12.json"),
  A2_K1: () => require("../assets/data/glossar_A2_K1.json"),
  A2_K2: () => require("../assets/data/glossar_A2_K2.json"),
  A2_K3: () => require("../assets/data/glossar_A2_K3.json"),
  A2_K4: () => require("../assets/data/glossar_A2_K4.json"),
  A2_K5: () => require("../assets/data/glossar_A2_K5.json"),
  A2_K6: () => require("../assets/data/glossar_A2_K6.json"),
  A2_K7: () => require("../assets/data/glossar_A2_K7.json"),
  A2_K8: () => require("../assets/data/glossar_A2_K8.json"),
  A2_K9: () => require("../assets/data/glossar_A2_K9.json"),
  A2_K10: () => require("../assets/data/glossar_A2_K10.json"),
  A2_K11: () => require("../assets/data/glossar_A2_K11.json"),
  A2_K12: () => require("../assets/data/glossar_A2_K12.json"),
  B1_K1: () => require("../assets/data/glossar_B1_K1.json"),
  B1_K2: () => require("../assets/data/glossar_B1_K2.json"),
  B1_K3: () => require("../assets/data/glossar_B1_K3.json"),
  B1_K4: () => require("../assets/data/glossar_B1_K4.json"),
  B1_K5: () => require("../assets/data/glossar_B1_K5.json"),
  B1_K6: () => require("../assets/data/glossar_B1_K6.json"),
  B1_K7: () => require("../assets/data/glossar_B1_K7.json"),
  B1_K8: () => require("../assets/data/glossar_B1_K8.json"),
  B1_K9: () => require("../assets/data/glossar_B1_K9.json"),
  B1_K10: () => require("../assets/data/glossar_B1_K10.json"),
  B1_K11: () => require("../assets/data/glossar_B1_K11.json"),
  B1_K12: () => require("../assets/data/glossar_B1_K12.json"),
};

const kapitelCache: { [key: string]: GlossarKapitelData } = {};

export function getGlossarKapitelWords(level: string, kapitel: number): GlossarWord[] {
  const key = `${level}_K${kapitel}`;
  if (!kapitelCache[key]) {
    const loader = GLOSSAR_DATA_MAP[key];
    if (!loader) return [];
    kapitelCache[key] = loader();
  }
  return kapitelCache[key].words ?? [];
}

export function useGlossarKapitel(level: string, kapitel: number): { words: GlossarWord[]; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [words, setWords] = useState<GlossarWord[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setWords(getGlossarKapitelWords(level, kapitel));
    setIsLoading(false);
  }, [level, kapitel]);

  return { words, isLoading };
}

let flatGlossarWordsCache: GlossarWord[] | null = null;

// Flattens every A1/A2/B1 kapitel plus every B2 kapitel/module word list into
// a single pool. Used by the home-screen widget (and anything else that just
// wants "a random word from the whole Glossar") instead of the level/kapitel
// picker flow the screens use.
export function getAllGlossarWordsFlat(): GlossarWord[] {
  if (flatGlossarWordsCache) {
    return flatGlossarWordsCache;
  }
  const all: GlossarWord[] = [];

  for (const level of ["A1", "A2", "B1"] as const) {
    for (let kapitel = 1; kapitel <= GLOSSAR_KAPITEL_COUNT[level]; kapitel++) {
      all.push(...getGlossarKapitelWords(level, kapitel));
    }
  }

  for (let kapitel = 1; kapitel <= GLOSSAR_KAPITEL_COUNT.B2; kapitel++) {
    const meta = getGlossarB2Meta(kapitel);
    for (const mod of meta?.modules ?? []) {
      all.push(...getGlossarB2ModuleWords(kapitel, mod.id));
    }
  }

  flatGlossarWordsCache = all;
  return all;
}

// ---- B2 module structure (meta + per-module word lists) ----

export interface GlossarB2Module {
  id: string; // e.g. "m1"
  title: string; // editable display name — rename freely in the data file
}

export interface GlossarB2MetaData {
  level: "B2";
  kapitel: number;
  modules: GlossarB2Module[];
}

const GLOSSAR_B2_META_MAP: { [key: string]: () => GlossarB2MetaData } = {
  "1": () => require("../assets/data/glossar_B2_K1_meta.json"),
  "2": () => require("../assets/data/glossar_B2_K2_meta.json"),
  "3": () => require("../assets/data/glossar_B2_K3_meta.json"),
  "4": () => require("../assets/data/glossar_B2_K4_meta.json"),
  "5": () => require("../assets/data/glossar_B2_K5_meta.json"),
  "6": () => require("../assets/data/glossar_B2_K6_meta.json"),
  "7": () => require("../assets/data/glossar_B2_K7_meta.json"),
  "8": () => require("../assets/data/glossar_B2_K8_meta.json"),
  "9": () => require("../assets/data/glossar_B2_K9_meta.json"),
  "10": () => require("../assets/data/glossar_B2_K10_meta.json"),
};

const b2MetaCache: { [key: string]: GlossarB2MetaData } = {};

export function getGlossarB2Meta(kapitel: number): GlossarB2MetaData | null {
  const key = String(kapitel);
  if (!b2MetaCache[key]) {
    const loader = GLOSSAR_B2_META_MAP[key];
    if (!loader) return null;
    b2MetaCache[key] = loader();
  }
  return b2MetaCache[key];
}

export function useGlossarB2Meta(kapitel: number): { modules: GlossarB2Module[]; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modules, setModules] = useState<GlossarB2Module[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setModules(getGlossarB2Meta(kapitel)?.modules ?? []);
    setIsLoading(false);
  }, [kapitel]);

  return { modules, isLoading };
}

const GLOSSAR_B2_MODULE_MAP: { [key: string]: () => GlossarKapitelData } = {
  K1_m1: () => require("../assets/data/glossar_B2_K1_M1.json"),
  K1_m2: () => require("../assets/data/glossar_B2_K1_M2.json"),
  K1_m3: () => require("../assets/data/glossar_B2_K1_M3.json"),
  K1_m4: () => require("../assets/data/glossar_B2_K1_M4.json"),
  K2_m1: () => require("../assets/data/glossar_B2_K2_M1.json"),
  K2_m2: () => require("../assets/data/glossar_B2_K2_M2.json"),
  K2_m3: () => require("../assets/data/glossar_B2_K2_M3.json"),
  K2_m4: () => require("../assets/data/glossar_B2_K2_M4.json"),
  K3_m1: () => require("../assets/data/glossar_B2_K3_M1.json"),
  K3_m2: () => require("../assets/data/glossar_B2_K3_M2.json"),
  K3_m3: () => require("../assets/data/glossar_B2_K3_M3.json"),
  K3_m4: () => require("../assets/data/glossar_B2_K3_M4.json"),
  K4_m1: () => require("../assets/data/glossar_B2_K4_M1.json"),
  K4_m2: () => require("../assets/data/glossar_B2_K4_M2.json"),
  K4_m3: () => require("../assets/data/glossar_B2_K4_M3.json"),
  K4_m4: () => require("../assets/data/glossar_B2_K4_M4.json"),
  K5_m1: () => require("../assets/data/glossar_B2_K5_M1.json"),
  K5_m2: () => require("../assets/data/glossar_B2_K5_M2.json"),
  K5_m3: () => require("../assets/data/glossar_B2_K5_M3.json"),
  K5_m4: () => require("../assets/data/glossar_B2_K5_M4.json"),
  K6_m1: () => require("../assets/data/glossar_B2_K6_M1.json"),
  K6_m2: () => require("../assets/data/glossar_B2_K6_M2.json"),
  K6_m3: () => require("../assets/data/glossar_B2_K6_M3.json"),
  K6_m4: () => require("../assets/data/glossar_B2_K6_M4.json"),
  K7_m1: () => require("../assets/data/glossar_B2_K7_M1.json"),
  K7_m2: () => require("../assets/data/glossar_B2_K7_M2.json"),
  K7_m3: () => require("../assets/data/glossar_B2_K7_M3.json"),
  K7_m4: () => require("../assets/data/glossar_B2_K7_M4.json"),
  K8_m1: () => require("../assets/data/glossar_B2_K8_M1.json"),
  K8_m2: () => require("../assets/data/glossar_B2_K8_M2.json"),
  K8_m3: () => require("../assets/data/glossar_B2_K8_M3.json"),
  K8_m4: () => require("../assets/data/glossar_B2_K8_M4.json"),
  K9_m1: () => require("../assets/data/glossar_B2_K9_M1.json"),
  K9_m2: () => require("../assets/data/glossar_B2_K9_M2.json"),
  K9_m3: () => require("../assets/data/glossar_B2_K9_M3.json"),
  K9_m4: () => require("../assets/data/glossar_B2_K9_M4.json"),
  K10_m1: () => require("../assets/data/glossar_B2_K10_M1.json"),
  K10_m2: () => require("../assets/data/glossar_B2_K10_M2.json"),
  K10_m3: () => require("../assets/data/glossar_B2_K10_M3.json"),
  K10_m4: () => require("../assets/data/glossar_B2_K10_M4.json"),
};

const b2ModuleCache: { [key: string]: GlossarKapitelData } = {};

export function getGlossarB2ModuleWords(kapitel: number, moduleId: string): GlossarWord[] {
  const key = `K${kapitel}_${moduleId}`;
  if (!b2ModuleCache[key]) {
    const loader = GLOSSAR_B2_MODULE_MAP[key];
    if (!loader) return [];
    b2ModuleCache[key] = loader();
  }
  return b2ModuleCache[key].words ?? [];
}

export function useGlossarB2Module(kapitel: number, moduleId: string): { words: GlossarWord[]; isLoading: boolean } {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [words, setWords] = useState<GlossarWord[]>([]);

  useEffect(() => {
    setIsLoading(true);
    setWords(getGlossarB2ModuleWords(kapitel, moduleId));
    setIsLoading(false);
  }, [kapitel, moduleId]);

  return { words, isLoading };
}
