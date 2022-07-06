export interface SpokenForm {
  spokenForm: string;
  description: string;
}

export interface CheatsheetSection {
  name: string;
  id: string;
  items: {
    identifier: string;
    type: string;
    spokenForms: SpokenForm[];
  }[];
}

export interface CheatsheetInfo {
  sections: CheatsheetSection[];
}
