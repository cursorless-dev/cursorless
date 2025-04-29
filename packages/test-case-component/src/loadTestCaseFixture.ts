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
  try {
    const before = await getBefore({
      stateName: "initialState",
      state: data.initialState,
      languageId: data.languageId,
    });

    const during = await getDuring(data);

    const after = await getAfter({
      stateName: "finalState",
      state: data.finalState,
      languageId: data.languageId,
    });

    return {
      language: data.languageId,
      command: data.command.spokenForm,
      during,
      before,
      after,
      filename: data.filename,
    };
  } catch (e) {
    console.log("error", e);
    console.log(JSON.stringify(data, null, 2));
    throw e;
  }
}

type Foo = TestCaseSnapshot & TargetPlainObject;

async function getAfter({
  stateName,
  state,
  languageId,
}: {
  stateName: string;
  state: Foo;
  languageId: BundledLanguage;
}) {
  if (!state) {
    throw new Error("finalState is undefined");
  }
  return await safeGenerateHtml({ stateName, state, languageId });
}

type DataFixture = Partial<TestCaseFixture & TargetPlainObject>

async function getDuring(data: DataFixture) {
  const { command, ide } = data
  const stateName = "middleState"
  const state = data.initialState
  const languageId = data.languageId as BundledLanguage
  const genObj: TestCaseSnapshot & { stateName: string } = { stateName, state, languageId, raw: data }
  if (command) {
    genObj.command = command
  }
  if (ide) {
    genObj.ide = ide
  }

  return await generateHtml(genObj);
}

async function getBefore({
  stateName,
  state,
  languageId,
}: {
  stateName: string;
  state: TestCaseSnapshot;
  languageId: BundledLanguage;
}) {
  return await safeGenerateHtml({ stateName, state, languageId });
}