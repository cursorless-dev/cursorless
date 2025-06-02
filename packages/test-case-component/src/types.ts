import type { TestCaseFixture, TestCaseSnapshot, PlainSpyIDERecordedValues, TargetPlainObject } from "@cursorless/common";
import type { BundledLanguage } from "shiki";



export type StepType = { stepName: "initialState" | "middleState" | "finalState" };
export type DataFixture = TestCaseFixture & StepType;

export interface LoadFixtureProps extends DataFixture {
  filename: string;
  languageId: BundledLanguage;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
}

export type Lang = BundledLanguage;
export type StepNameType = "before" | "during" | "after";

export type ExtendedTestCaseSnapshot = TestCaseSnapshot &
  Partial<PlainSpyIDERecordedValues> & {
    finalStateMarkHelpers?: {
      thatMark?: TargetPlainObject[];
      sourceMark?: TargetPlainObject[];
    };
  };

export type LineRange = { type: string; start: number; end: number };
export type PositionRange = { type: string; start: { line: number; character: number }; end: { line: number; character: number } };
export type RangeType = LineRange | PositionRange;
