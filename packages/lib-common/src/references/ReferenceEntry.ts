export interface SpokenFormReference {
  defaultSpokenForm?: string;
  private?: boolean;
  disabledByDefault?: boolean;
}

export interface ReferenceEntry extends SpokenFormReference {
  name: string;
  nameShort?: string;
  legacySpokenForms?: string[];
  description?: string;
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
