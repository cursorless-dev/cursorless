import type { TestCaseFixture, TestCaseSnapshot } from "@cursorless/common";
import { generateHtml } from "./generateHtml";
import type { BundledLanguage } from "shiki";

interface loadFixtureProps extends DataFixture {
  filename: string;
  languageId: BundledLanguage;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
}

type StepType = { stepName: "initialState" | "middleState" | "finalState" }
export type DataFixture = TestCaseFixture & StepType

export async function loadTestCaseFixture(data: loadFixtureProps) {
  const { before, during, after } = await generateHtml(data)

  const { command, filename, languageId: language } = data

  const returnObj = {
    before, during, after, command, filename, language
  }
  try {

    return returnObj

  } catch (e) {
    console.error("error", e);
    throw e;
  }
}

