import type { ScopeTypeInfo } from "@cursorless/common";
import { DOCS_URL, sleep } from "@cursorless/common";
import { getCursorlessApi } from "@cursorless/vscode-common";
import { stat, unlink, writeFile } from "fs/promises";
import * as sinon from "sinon";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

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
    );

    await writeFile(
      cursorlessTalonStateJsonPath,
      JSON.stringify(spokenFormJsonContents),
    );
    await assertCalledWithScopeInfo(
      fake,
      roundCustom,
      namedFunctionCustom,
      lambdaCustom,
      statementMissing,
      squareMissing,
    );

    await unlink(cursorlessTalonStateJsonPath);
    await assertCalledWithScopeInfo(
      fake,
      roundStandard,
      namedFunctionStandard,
      lambdaStandard,
      statementStandard,
      squareStandard,
    );
  } finally {
    disposable.dispose();

    // Delete cursorlessTalonStateJsonPath if it exists
    try {
      await stat(cursorlessTalonStateJsonPath);
      await unlink(cursorlessTalonStateJsonPath);
      // Sleep to ensure that the scope support provider has time to update
      // before the next test starts
      await sleep(400);
    } catch (_e) {
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
    reason: `paired delimiter with id squareBrackets; please update talon to the latest version (see ${DOCS_URL}/user/updating)`,
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
    reason: `simple scope type type with id anonymousFunction; please see ${DOCS_URL}/user/customization for more information`,
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
    reason: `simple scope type type with id statement; please update talon to the latest version (see ${DOCS_URL}/user/updating)`,
    requiresTalonUpdate: true,
    type: "error",
  },
};
