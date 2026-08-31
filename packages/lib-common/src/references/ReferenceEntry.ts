export interface SpokenFormReference {
  defaultSpokenForm?: string;
  private?: boolean;
  disabledByDefault?: boolean;
}

export interface ReferenceEntry<T extends string> extends SpokenFormReference {
  name: string;
  csv_id?: string;
  legacySpokenForms?: string[];
  description?: string;
  group: GroupDefinition<T>;
  syntaxes: SyntaxDefinition[];
  examples: ExampleDefinition[];
}

export interface ReferenceGroup<T extends string> {
  id: T;
  name: string;
}

interface GroupDefinition<T extends string> {
  id: T;
  index: number;
}

interface SyntaxDefinition {
  pattern: string;
  description: string;
  cheatsheet: string;
}

interface ExampleDefinition {
  command: string;
  description: string;
}
