export type {
  CheatsheetInfo,
  CheatsheetSection,
  CheatsheetVariation as Variation,
} from "@cursorless/lib-common/cheatsheet";

interface CheatsheetLegendEntry {
  term: string;
  definition: string;
  link?: string;
  linkName?: string;
  id: string;
}

export type CheatsheetLegend = CheatsheetLegendEntry[];
