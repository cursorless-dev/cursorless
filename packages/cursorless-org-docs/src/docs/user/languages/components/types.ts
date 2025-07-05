import type {
  ScopeSupportFacet,
  TextualScopeSupportFacet,
} from "@cursorless/common";

export interface ScopeTestsJson {
  imports: Record<string, string[]>;
  fixtures: Fixture[];
}

export interface Fixture {
  name: string;
  facet: ScopeSupportFacet | TextualScopeSupportFacet;
  languageId: string;
  code: string;
  scopes: Scope[];
}

export interface Scope {
  domain?: string;
  targets: Target[];
}

export interface Target {
  content: string;
  removal?: string;
}
