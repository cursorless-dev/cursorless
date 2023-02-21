import { TestCaseFixture } from "@cursorless/cursorless-engine";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
