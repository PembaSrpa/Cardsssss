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

export interface IELTSSectionGroup {
  id: string;
  title: string;
  subtitle: string;
  categories: string[];
}

export const IELTS_SECTION_GROUPS: IELTSSectionGroup[] = [
  {
    id: "1",
    title: "Core Academic Vocabulary",
    subtitle: "General Logic & Argumentation",
    categories: ["1A", "1B", "1C", "1D"],
  },
  {
    id: "2",
    title: "Trend, Data & Diagram Language",
    subtitle: "Writing Task 1",
    categories: ["2A", "2B", "2C", "2D", "2E", "2F"],
  },
  {
    id: "3",
    title: "Topic-Specific Modules",
    subtitle: "Thematic Vocabulary",
    categories: ["3A", "3B", "3C", "3D", "3E", "3F", "3G"],
  },
  {
    id: "4",
    title: "Structural, Functional & Idiomatic Language",
    subtitle: "",
    categories: ["4A", "4B", "4C", "4D", "4E", "4F"],
  },
  {
    id: "5",
    title: "Speaking Topics",
    subtitle: "Part 1, 2 & 3 Practice Questions",
    categories: ["5A", "5B", "5C", "5D", "5E", "5F", "5G", "5H", "5I", "5J", "5K", "5L", "5M", "5N", "5O", "5P", "5Q", "5R", "5S", "5T", "5U", "5V", "5W", "5X", "5Y", "5Z", "5AA", "5AB", "5AC", "5AD", "5AE", "5AF", "5AG", "5AH", "5AI", "5AJ", "5AK", "5AL", "5AM", "5AN", "5AO", "5AP", "5AQ", "5AR", "5AS", "5AT", "5AU", "5AV", "5AW", "5AX", "5AY", "5AZ", "5BA", "5BB", "5BC", "5BD", "5BE", "5BF"],
  },
];

export function getSectionGroupId(section: string): string {
  const match = section.match(/^\d+/);
  return match ? match[0] : "1";
}

const sectionCache: { [key: string]: IELTSSectionData } = {};

let flatWordsCache: IELTSWord[] | null = null;

export function getAllIELTSWordsFlat(): IELTSWord[] {
  if (flatWordsCache) {
    return flatWordsCache;
  }
  const all: IELTSWord[] = [];
  for (const section of AVAILABLE_IELTS_SECTIONS) {
    const data = loadSection(section);
    if (data) {
      all.push(...data.words);
    }
  }
  flatWordsCache = all;
  return all;
}

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
