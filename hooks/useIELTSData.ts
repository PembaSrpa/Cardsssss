import { useEffect, useState } from "react";

export interface IELTSWord {
  id: string;
  word: string;
  type: string;
  category: string;
  meaning: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}

export interface IELTSSectionData {
  section: string;
  title: string;
  words: IELTSWord[];
}

export interface UseIELTSDataResult {
  words: IELTSWord[];
  title: string;
  section: string;
  isLoading: boolean;
}

const IELTS_DATA_MAP: { [key: string]: () => IELTSSectionData } = {
  "1A": () => require("../assets/data/ielts_1A.json"),
  "1B": () => require("../assets/data/ielts_1B.json"),
  "1C": () => require("../assets/data/ielts_1C.json"),
  "1D": () => require("../assets/data/ielts_1D.json"),
  "2A": () => require("../assets/data/ielts_2A.json"),
  "2B": () => require("../assets/data/ielts_2B.json"),
  "2C": () => require("../assets/data/ielts_2C.json"),
  "2D": () => require("../assets/data/ielts_2D.json"),
  "2E": () => require("../assets/data/ielts_2E.json"),
  "2F": () => require("../assets/data/ielts_2F.json"),
  "3A": () => require("../assets/data/ielts_3A.json"),
  "3B": () => require("../assets/data/ielts_3B.json"),
  "3C": () => require("../assets/data/ielts_3C.json"),
  "3D": () => require("../assets/data/ielts_3D.json"),
  "3E": () => require("../assets/data/ielts_3E.json"),
  "3F": () => require("../assets/data/ielts_3F.json"),
  "3G": () => require("../assets/data/ielts_3G.json"),
  "4A": () => require("../assets/data/ielts_4A.json"),
  "4B": () => require("../assets/data/ielts_4B.json"),
  "4C": () => require("../assets/data/ielts_4C.json"),
  "4D": () => require("../assets/data/ielts_4D.json"),
  "4E": () => require("../assets/data/ielts_4E.json"),
  "4F": () => require("../assets/data/ielts_4F.json"),
};

export const AVAILABLE_IELTS_SECTIONS: string[] = Object.keys(IELTS_DATA_MAP);

const sectionCache: { [key: string]: IELTSSectionData } = {};

function loadSection(section: string): IELTSSectionData | null {
  if (sectionCache[section]) {
    return sectionCache[section];
  }

  const loader = IELTS_DATA_MAP[section];
  if (!loader) {
    return null;
  }

  const data = loader();
  sectionCache[section] = data;
  return data;
}

export function useIELTSData(section: string): UseIELTSDataResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<IELTSSectionData | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const result = loadSection(section);
    setData(result);
    setIsLoading(false);
  }, [section]);

  return {
    words: data?.words ?? [],
    title: data?.title ?? "",
    section: data?.section ?? section,
    isLoading,
  };
}
