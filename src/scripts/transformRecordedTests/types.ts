import { TestCaseFixture } from "../../testUtil/TestCase";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture
) => TestCaseFixture;
