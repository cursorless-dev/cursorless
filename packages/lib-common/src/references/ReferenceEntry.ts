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

export interface GroupedReferenceEntry<
  T extends string,
> extends ReferenceEntry {
  group: {
    id: T;
    index: number;
  };
}

type ActionReferenceGroupId =
  | "cursor"
  | "change"
  | "clone"
  | "clipboard"
  | "swap"
  | "indentation"
  | "numbers"
  | "emptyLines"
  | "homophones"
  | "rename"
  | "scroll"
  | "insert"
  | "move"
  | "reorder"
  | "wrap"
  | "navigation"
  | "folding"
  | "extract"
  | "join"
  | "break"
  | "visual"
  | "snippets"
  | "git"
  | "editor"
  | "targetContext"
  | "private";

export interface ReferenceGroup<T extends string> {
  id: T;
  name: string;
  description: string[];
}

export type ActionReferenceGroup = ReferenceGroup<ActionReferenceGroupId>;

export type ActionReferenceEntry =
  GroupedReferenceEntry<ActionReferenceGroupId>;

interface SyntaxDefinition {
  pattern: string;
  description: string;
  cheatsheet: string;
}

interface ExampleDefinition {
  command: string;
  description: string;
}
