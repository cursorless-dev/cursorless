import { TestCaseFixtureLegacy } from "@cursorless/common";

export type FixtureTransformation = (
  originalFixture: TestCaseFixtureLegacy,
) => TestCaseFixtureLegacy | undefined;
