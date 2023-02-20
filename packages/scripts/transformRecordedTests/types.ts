import { TestCaseFixture } from "../../cursorless-engine/testCaseRecorder/TestCaseFixture";

export type FixtureTransformation = (
  originalFixture: TestCaseFixture,
) => TestCaseFixture;
