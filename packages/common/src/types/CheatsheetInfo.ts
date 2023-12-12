export interface Variation {
  spokenForm: string;
  description: string;
}

export interface CheatsheetSection {
  name: string;
  id: string;
  items: {
    id: string;
    type: string;
    // Currently only a single variation is generated10s
    variations: Variation[];
  }[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
