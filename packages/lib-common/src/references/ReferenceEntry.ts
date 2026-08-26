export interface ReferenceEntry {
  name: string;
  private?: boolean;
  description?: string;
  legacySpokenForms?: string[];
  syntaxes: SyntaxDefinition[];
  examples: ExampleDefinition[];
}

interface SyntaxDefinition {
  pattern: string;
  description: string;
  cheatsheet: string;
}

interface ExampleDefinition {
  spokenForm: string;
  description: string;
}
