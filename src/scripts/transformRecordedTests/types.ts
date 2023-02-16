import { TestCaseFixture } from "../../packages/cursorless-engine/testCaseRecorder/TestCaseFixture";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
