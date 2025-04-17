import type { TargetPlainObject, TestCaseFixture, TestCaseSnapshot } from "@cursorless/common";
import { generateHtml } from "./generateHtml.js";
import type { BundledLanguage } from "shiki";

async function safeGenerateHtml({
  stateName,
  state,
  languageId,
  command,
  ide,
  thatMarkFinalState
}: {
  stateName: string;
  state: TestCaseSnapshot;
  languageId: BundledLanguage;
  command?: any; // Replace `any` with the appropriate type if known
  ide?: any; // Replace `any` with the appropriate type if known
  thatMarkFinalState?: TargetPlainObject
}) {
  console.log("✨" + stateName + "✨");
  try {
    const genObj = { stateName, state, languageId, command, ide }
    return await generateHtml(genObj);
  } catch (e) {
    console.error("error in state", stateName, e);
    console.error(JSON.stringify(state, null, 2));
    throw e;
  }
}

interface loadFixtureProps extends TestCaseFixture {
  filename: string;
  languageId: BundledLanguage;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
}

export async function loadFixture(data: loadFixtureProps) {
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
  const { thatMark: thatMarkFinalState } = data.finalState
  const genObj: TestCaseSnapshot & typeof thatMarkFinalState = { stateName, state, languageId, raw: data }
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