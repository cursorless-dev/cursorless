import type {
  BorderStyle,
  PlaintextScopeSupportFacet,
  ScopeSupportFacet,
  Range,
  TestCaseFixtureLegacy,
} from "@cursorless/lib-common";

export type RangeType = "content" | "removal" | "blend";
export type FacetValue = ScopeSupportFacet | PlaintextScopeSupportFacet;

export interface RecordedTest {
  path: string;
  name: string;
  fixture: TestCaseFixtureLegacy;
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

export interface Highlight {
  range: Range;
  style: Style;
}

export interface Style {
  backgroundColor: string;
  borderColorSolid: string;
  borderColorPorous: string;
  borderRadius: BorderRadius;
  borderStyle: {
    top: BorderStyle;
    bottom: BorderStyle;
    left: BorderStyle;
    right: BorderStyle;
  };
}

export interface BorderRadius {
  topLeft: boolean;
  topRight: boolean;
  bottomRight: boolean;
  bottomLeft: boolean;
}
