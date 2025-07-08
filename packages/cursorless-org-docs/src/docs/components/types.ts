import type {
  ScopeSupportFacet,
  PlaintextScopeSupportFacet,
} from "@cursorless/common";

export type RangeType = "content" | "removal";
export type FacetValue = ScopeSupportFacet | PlaintextScopeSupportFacet;

export interface ScopeTests {
  imports: Record<string, string[]>;
  fixtures: Fixture[];
}

export interface Fixture {
  name: string;
  facet: FacetValue;
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

export interface RangeTypeColors {
  background: string;
  borderSolid: string;
  borderPorous: string;
}
