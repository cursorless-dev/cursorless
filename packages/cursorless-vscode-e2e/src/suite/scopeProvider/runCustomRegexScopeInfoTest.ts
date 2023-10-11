import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import {
  LATEST_VERSION,
  ScopeSupport,
  ScopeSupportInfo,
  ScopeSupportLevels,
  ScopeType,
  sleep,
} from "@cursorless/common";
import Sinon = require("sinon");
import {
  assertCalledWithScopeInfo,
  assertCalledWithoutScopeInfo as assertCalledWithoutScope,
} from "./assertCalledWithScopeInfo";
import { stat, unlink, writeFile } from "fs/promises";
import { sleepWithBackoff } from "../../endToEndTestSetup";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple named function.
 */
export async function runCustomRegexScopeInfoTest() {
  const { scopeProvider, spokenFormsJsonPath } = (await getCursorlessApi())
    .testHelpers!;
  const fake = Sinon.fake<[scopeInfos: ScopeSupportLevels], void>();

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    await assertCalledWithoutScope(fake, scopeType);

    await writeFile(
      spokenFormsJsonPath,
      JSON.stringify(spokenFormJsonContents),
    );
    await sleepWithBackoff(50);
    await assertCalledWithScopeInfo(fake, unsupported);

    await openNewEditor(contents);
    await assertCalledWithScopeInfo(fake, present);

    await unlink(spokenFormsJsonPath);
    await sleepWithBackoff(50);
    await assertCalledWithoutScope(fake, scopeType);
  } finally {
    disposable.dispose();

    // Delete spokenFormsJsonPath if it exists
    try {
      await stat(spokenFormsJsonPath);
      await unlink(spokenFormsJsonPath);
      // Sleep to ensure that the scope support provider has time to update
      // before the next test starts
      await sleep(50);
    } catch (e) {
      // Do nothing
    }
  }
}

const contents = `
hello world
`;

const regex = "[a-zA-Z]+";

const spokenFormJsonContents = {
  version: LATEST_VERSION,
  entries: [
    {
      type: "customRegex",
      id: regex,
      spokenForms: ["spaghetti"],
    },
  ],
};

const scopeType: ScopeType = {
  type: "customRegex",
  regex,
};

function getExpectedScope(scopeSupport: ScopeSupport): ScopeSupportInfo {
  return {
    humanReadableName: "Regex `[a-zA-Z]+`",
    isLanguageSpecific: false,
    iterationScopeSupport:
      scopeSupport === ScopeSupport.unsupported
        ? ScopeSupport.unsupported
        : ScopeSupport.supportedAndPresentInEditor,
    scopeType,
    spokenForm: {
      alternatives: [],
      preferred: "spaghetti",
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const present = getExpectedScope(ScopeSupport.supportedAndPresentInEditor);
