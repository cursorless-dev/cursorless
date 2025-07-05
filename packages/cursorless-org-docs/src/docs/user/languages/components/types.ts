import type {
  ScopeSupportFacet,
  PlaintextScopeSupportFacet,
} from "@cursorless/common";

export interface ScopeTestsJson {
  imports: Record<string, string[]>;
  fixtures: Fixture[];
}

export interface Fixture {
  name: string;
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet;
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
