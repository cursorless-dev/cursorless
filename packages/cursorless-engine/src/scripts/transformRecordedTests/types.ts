import { TestCaseFixture } from "@cursorless/common";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
