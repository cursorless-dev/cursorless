export interface Variation {
  spokenForm: string;
  description: string;
  usageCount?: number;
}

export interface CheatsheetSection {
  name: string;
  id: string;
  items: {
    id: string;
    type: string;
    // Are these variations for a single command?
    // See example
    variations: Variation[];
  }[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
