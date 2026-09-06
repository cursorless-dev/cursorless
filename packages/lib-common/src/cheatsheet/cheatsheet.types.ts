export interface CheatsheetVariation {
  spokenForm: string;
  description: string;
}

export interface CheatsheetItem {
  id: string;
  type: string;
  variations: CheatsheetVariation[];
}

export interface CheatsheetSection {
  name: string;
  id: string;
  items: CheatsheetItem[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
