import { TestCaseFixture } from "../../testUtil/TestCaseFixture";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
