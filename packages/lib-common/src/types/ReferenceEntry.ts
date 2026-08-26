export interface ReferenceEntry {
  id: string;
  kind: "action" | "modifier" | "scope" | "mark";
  name: string;
  private?: boolean;
  description?: string;
  legacySpokenForms?: string[];
  syntaxes: SyntaxDefinition[];
  examples: ExampleDefinition[];
}

export type ReferenceEntryWithoutIdKind = Omit<ReferenceEntry, "id" | "kind">;

interface SyntaxDefinition {
  pattern: string;
  description: string;
  cheatsheet: string;
}

interface ExampleDefinition {
  spokenForm: string;
  description: string;
}
