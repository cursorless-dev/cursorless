import { TestCaseFixture } from "../../libs/cursorless-engine/testCaseRecorder/TestCaseFixture";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
