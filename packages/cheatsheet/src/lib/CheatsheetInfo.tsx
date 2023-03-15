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
    variations: Variation[];
  }[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
