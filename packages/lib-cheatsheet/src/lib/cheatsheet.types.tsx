interface CheatsheetLegendEntry {
  term: string;
  definition: string;
  link?: string;
  linkName?: string;
  id: string;
}

export type CheatsheetLegend = CheatsheetLegendEntry[];
