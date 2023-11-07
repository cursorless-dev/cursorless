import { getCursorlessApi } from "@cursorless/vscode-common";
import { ScopeTypeInfo, sleep } from "@cursorless/common";
import * as sinon from "sinon";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";
import { stat, unlink, writeFile } from "fs/promises";
import { sleepWithBackoff } from "../../endToEndTestSetup";

/**
 * Tests that the scope provider correctly reports custom spoken forms
 */
export async function runCustomSpokenFormScopeInfoTest() {
  const { scopeProvider, cursorlessTalonStateJsonPath } = (
    await getCursorlessApi()
  ).testHelpers!;
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
      cursorlessTalonStateJsonPath,
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

    await unlink(cursorlessTalonStateJsonPath);
    await sleepWithBackoff(100);
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

    // Delete cursorlessTalonStateJsonPath if it exists
    try {
      await stat(cursorlessTalonStateJsonPath);
      await unlink(cursorlessTalonStateJsonPath);
      // Sleep to ensure that the scope support provider has time to update
      // before the next test starts
      await sleep(250);
    } catch (e) {
      // Do nothing
    }
  }
}

const spokenFormJsonContents = {
  version: 0,
  spokenForms: [
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
    isPrivate: true,
    reason:
      "simple scope type type with id switchStatementSubject; this is a private spoken form currently only for internal experimentation",
    requiresTalonUpdate: false,
    type: "error",
  },
};

const subjectCustom: ScopeTypeInfo = {
  humanReadableName: "switch statement subject",
  isLanguageSpecific: true,
  scopeType: { type: "switchStatementSubject" },
  spokenForm: {
    spokenForms: ["custom subject"],
    type: "success",
  },
};

const roundStandard: ScopeTypeInfo = {
  humanReadableName: "Matching pair of parentheses",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "parentheses" },
  spokenForm: {
    spokenForms: ["round"],
    type: "success",
  },
};

const roundCustom: ScopeTypeInfo = {
  humanReadableName: "Matching pair of parentheses",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "parentheses" },
  spokenForm: {
    spokenForms: ["custom round", "alternate custom round"],
    type: "success",
  },
};

const squareStandard: ScopeTypeInfo = {
  humanReadableName: "Matching pair of square brackets",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "squareBrackets" },
  spokenForm: {
    spokenForms: ["box"],
    type: "success",
  },
};

const squareMissing: ScopeTypeInfo = {
  humanReadableName: "Matching pair of square brackets",
  isLanguageSpecific: false,
  scopeType: { type: "surroundingPair", delimiter: "squareBrackets" },
  spokenForm: {
    isPrivate: false,
    reason:
      "paired delimiter with id squareBrackets; please update talon to the latest version (see https://www.cursorless.org/docs/user/updating/)",
    requiresTalonUpdate: true,
    type: "error",
  },
};

const namedFunctionStandard: ScopeTypeInfo = {
  humanReadableName: "named function",
  isLanguageSpecific: true,
  scopeType: { type: "namedFunction" },
  spokenForm: {
    spokenForms: ["funk"],
    type: "success",
  },
};

const namedFunctionCustom: ScopeTypeInfo = {
  humanReadableName: "named function",
  isLanguageSpecific: true,
  scopeType: { type: "namedFunction" },
  spokenForm: {
    spokenForms: ["custom funk"],
    type: "success",
  },
};

const lambdaStandard: ScopeTypeInfo = {
  humanReadableName: "anonymous function",
  isLanguageSpecific: true,
  scopeType: { type: "anonymousFunction" },
  spokenForm: {
    spokenForms: ["lambda"],
    type: "success",
  },
};

const lambdaCustom: ScopeTypeInfo = {
  humanReadableName: "anonymous function",
  isLanguageSpecific: true,
  scopeType: { type: "anonymousFunction" },
  spokenForm: {
    isPrivate: false,
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
    spokenForms: ["state"],
    type: "success",
  },
};

const statementMissing: ScopeTypeInfo = {
  humanReadableName: "statement",
  isLanguageSpecific: true,
  scopeType: { type: "statement" },
  spokenForm: {
    isPrivate: false,
    reason:
      "simple scope type type with id statement; please update talon to the latest version (see https://www.cursorless.org/docs/user/updating/)",
    requiresTalonUpdate: true,
    type: "error",
  },
};
