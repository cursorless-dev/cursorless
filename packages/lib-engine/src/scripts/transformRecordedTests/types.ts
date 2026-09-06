import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";

export type FixtureTransformation = (
  originalFixture: TestCaseFixtureLegacy,
) => TestCaseFixtureLegacy | undefined;
