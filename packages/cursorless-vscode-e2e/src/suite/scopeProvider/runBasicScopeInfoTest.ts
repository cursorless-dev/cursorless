import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import {
  ScopeSupport,
  ScopeSupportInfo,
  ScopeSupportLevels,
} from "@cursorless/common";
import Sinon = require("sinon");
import { sleepWithBackoff } from "../../endToEndTestSetup";
import { commands } from "vscode";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple named function.
 */
export async function runBasicScopeInfoTest() {
  const { scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const fake = Sinon.fake<[scopeInfos: ScopeSupportLevels], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    assertCalledWithScopeInfo(fake, unsupported);

    await openNewEditor(contents, {
      languageId: "typescript",
    });
    await sleepWithBackoff(25);

    assertCalledWithScopeInfo(fake, present);

    await commands.executeCommand("workbench.action.closeAllEditors");
    await sleepWithBackoff(25);

    assertCalledWithScopeInfo(fake, unsupported);
  } finally {
    disposable.dispose();
  }
}

const contents = `
function helloWorld() {

}
`;

function getExpectedScope(scopeSupport: ScopeSupport): ScopeSupportInfo {
  return {
    humanReadableName: "named function",
    isLanguageSpecific: true,
    iterationScopeSupport: scopeSupport,
    scopeType: {
      type: "namedFunction",
    },
    spokenForm: {
      alternatives: [],
      preferred: "funk",
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const present = getExpectedScope(ScopeSupport.supportedAndPresentInEditor);
