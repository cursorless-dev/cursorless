import type { TestCaseFixtureLegacy } from "@cursorless/common";

export type FixtureTransformation = (
  originalFixture: TestCaseFixtureLegacy,
) => TestCaseFixtureLegacy | undefined;
