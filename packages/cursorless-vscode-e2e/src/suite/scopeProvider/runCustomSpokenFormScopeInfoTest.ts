import { getCursorlessApi } from "@cursorless/vscode-common";
import { LATEST_VERSION, ScopeTypeInfo, sleep } from "@cursorless/common";
import * as sinon from "sinon";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";
import { stat, unlink, writeFile } from "fs/promises";
import { sleepWithBackoff } from "../../endToEndTestSetup";

/**
 * Tests that the scope provider correctly reports custom spoken forms
 */
export async function runCustomSpokenFormScopeInfoTest() {
  const { scopeProvider, spokenFormsJsonPath } = (await getCursorlessApi())
    .testHelpers!;
  const fake = sinon.fake<[scopeInfos: ScopeTypeInfo[]], void>();

  const disposable = scopeProvider.onDidChangeScopeInfo(fake);

  try {
    await assertCalledWithScopeInfo(
      fake,
      roundStandard,
      namedFunctionStandard,
      lambdaStandard,
      statementStandard,
      squareStandard,
      subjectStandard,
    );

    await writeFile(
      spokenFormsJsonPath,
      JSON.stringify(spokenFormJsonContents),
    );
    await sleepWithBackoff(50);
    await assertCalledWithScopeInfo(
      fake,
      subjectCustom,
      roundCustom,
      namedFunctionCustom,
      lambdaCustom,
      statementMissing,
      squareMissing,
    );

    await unlink(spokenFormsJsonPath);
    await sleepWithBackoff(50);
    await assertCalledWithScopeInfo(
      fake,
      roundStandard,
      namedFunctionStandard,
      lambdaStandard,
      statementStandard,
      squareStandard,
      subjectStandard,
    );
  } finally {
    disposable.dispose();

    // Delete spokenFormsJsonPath if it exists
    try {
      await stat(spokenFormsJsonPath);
      await unlink(spokenFormsJsonPath);
      // Sleep to ensure that the scope support provider has time to update
      // before the next test starts
      await sleep(250);
    } catch (e) {
      // Do nothing
    }
  }
}

const spokenFormJsonContents = {
  version: LATEST_VERSION,
  entries: [
    {
      type: "pairedDelimiter",
      id: "parentheses",
      spokenForms: ["custom round", "alternate custom round"],
    },
    {
      type: "simpleScopeTypeType",
      id: "switchStatementSubject",
      spokenForms: ["custom subject"],
    },
    {
      type: "simpleScopeTypeType",
      id: "namedFunction",
      spokenForms: ["custom funk"],
    },
    {
      type: "simpleScopeTypeType",
      id: "anonymousFunction",
      spokenForms: [],
    },
  ],
};

const subjectStandard: ScopeTypeInfo = {
  humanReadableName: "switch statement subject",
  isLanguageSpecific: true,
  scopeType: { type: "switchStatementSubject" },
  spokenForm: {
    isSecret: true,
    reason:
      "simple scope type type with id switchStatementSubject; please see https://www.cursorless.org/docs/user/customization/ for more information",
    requiresTalonUpdate: false,
    type: "error",
  },
};

const subjectCustom: ScopeTypeInfo = {
  humanReadableName: "switch statement subject",
  isLanguageSpecific: true,
  scopeType: { type: "switchStatementSubject" },
  spokenForm: {
    alternatives: [],
    preferred: "custom subject",
    type: "success",
  },
};

const roundStandard: ScopeTypeInfo = {
  humanReadableName: "Matching pair of parentheses",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "parentheses" },
  spokenForm: {
    alternatives: [],
    preferred: "round",
    type: "success",
  },
};

const roundCustom: ScopeTypeInfo = {
  humanReadableName: "Matching pair of parentheses",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "parentheses" },
  spokenForm: {
    alternatives: ["alternate custom round"],
    preferred: "custom round",
    type: "success",
  },
};

const squareStandard: ScopeTypeInfo = {
  humanReadableName: "Matching pair of square brackets",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "squareBrackets" },
  spokenForm: {
    alternatives: [],
    preferred: "box",
    type: "success",
  },
};

const squareMissing: ScopeTypeInfo = {
  humanReadableName: "Matching pair of square brackets",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "squareBrackets" },
  spokenForm: {
    isSecret: false,
    reason:
      "paired delimiter with id squareBrackets; please see https://www.cursorless.org/docs/user/customization/ for more information",
    requiresTalonUpdate: true,
    type: "error",
  },
};

const namedFunctionStandard: ScopeTypeInfo = {
  humanReadableName: "named function",
  isLanguageSpecific: true,
  scopeType: { type: "namedFunction" },
  spokenForm: {
    alternatives: [],
    preferred: "funk",
    type: "success",
  },
};

const namedFunctionCustom: ScopeTypeInfo = {
  humanReadableName: "named function",
  isLanguageSpecific: true,
  scopeType: { type: "namedFunction" },
  spokenForm: {
    alternatives: [],
    preferred: "custom funk",
    type: "success",
  },
};

const lambdaStandard: ScopeTypeInfo = {
  humanReadableName: "anonymous function",
  isLanguageSpecific: true,
  scopeType: { type: "anonymousFunction" },
  spokenForm: {
    alternatives: [],
    preferred: "lambda",
    type: "success",
  },
};

const lambdaCustom: ScopeTypeInfo = {
  humanReadableName: "anonymous function",
  isLanguageSpecific: true,
  scopeType: { type: "anonymousFunction" },
  spokenForm: {
    isSecret: false,
    reason:
      "simple scope type type with id anonymousFunction; please see https://www.cursorless.org/docs/user/customization/ for more information",
    requiresTalonUpdate: false,
    type: "error",
  },
};

const statementStandard: ScopeTypeInfo = {
  humanReadableName: "statement",
  isLanguageSpecific: true,
  scopeType: { type: "statement" },
  spokenForm: {
    alternatives: [],
    preferred: "state",
    type: "success",
  },
};

const statementMissing: ScopeTypeInfo = {
  humanReadableName: "statement",
  isLanguageSpecific: true,
  scopeType: { type: "statement" },
  spokenForm: {
    isSecret: false,
    reason:
      "simple scope type type with id statement; please see https://www.cursorless.org/docs/user/customization/ for more information",
    requiresTalonUpdate: true,
    type: "error",
  },
};
