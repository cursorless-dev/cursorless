import { TestCaseFixture } from "../../testCaseRecorder/TestCaseFixture";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
