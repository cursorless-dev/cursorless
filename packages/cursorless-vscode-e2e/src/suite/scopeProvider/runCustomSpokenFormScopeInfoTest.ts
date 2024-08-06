import type { ScopeTypeInfo, SpokenFormEntry } from "@cursorless/common";
import { getCursorlessApi } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports custom spoken forms
 */
export async function runCustomSpokenFormScopeInfoTest() {
  const { scopeProvider, talonSpokenForms } = (await getCursorlessApi())
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

    talonSpokenForms.mockSpokenFormEntries(spokenFormEntries);
    await assertCalledWithScopeInfo(
      fake,
      subjectCustom,
      roundCustom,
      namedFunctionCustom,
      lambdaCustom,
      statementMissing,
      squareMissing,
    );

    talonSpokenForms.mockSpokenFormEntries(null);
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
  }
}

const spokenFormEntries: SpokenFormEntry[] = [
  {
    type: "pairedDelimiter",
    id: "parentheses",
    spokenForms: ["custom round", "alternate custom round"],
  },
  {
    type: "simpleScopeTypeType",
    id: "private.switchStatementSubject",
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
];

const subjectStandard: ScopeTypeInfo = {
  humanReadableName: "private switch statement subject",
  isLanguageSpecific: true,
  scopeType: { type: "private.switchStatementSubject" },
  spokenForm: {
    isPrivate: true,
    reason:
      "simple scope type type with id private.switchStatementSubject; this is a private spoken form currently only for internal experimentation",
    requiresTalonUpdate: false,
    type: "error",
  },
};

const subjectCustom: ScopeTypeInfo = {
  humanReadableName: "private switch statement subject",
  isLanguageSpecific: true,
  scopeType: { type: "private.switchStatementSubject" },
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
