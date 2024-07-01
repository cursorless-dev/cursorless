import { ScopeSupport, ScopeSupportInfo } from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import { Position, commands } from "vscode";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple surrounding pair.
 */
export async function runSurroundingPairScopeInfoTest() {
  const { scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const fake = sinon.fake<[scopeInfos: ScopeSupportInfo[]], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    await assertCalledWithScopeInfo(fake, unsupported);

    const editor = await openNewEditor("");
    await assertCalledWithScopeInfo(fake, supported);

    await editor.edit((editBuilder) => {
      editBuilder.insert(new Position(0, 0), "()");
    });
    await assertCalledWithScopeInfo(fake, present);

    await commands.executeCommand("workbench.action.closeAllEditors");
    await assertCalledWithScopeInfo(fake, unsupported);
  } finally {
    disposable.dispose();
  }
}

function getExpectedScope(scopeSupport: ScopeSupport): ScopeSupportInfo {
  return {
    humanReadableName: "Matching pair of parentheses",
    isLanguageSpecific: false,
    iterationScopeSupport:
      scopeSupport === ScopeSupport.unsupported
        ? ScopeSupport.unsupported
        : ScopeSupport.supportedLegacy,
    scopeType: { type: "surroundingPair", delimiter: "parentheses" },
    spokenForm: {
      spokenForms: ["round"],
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const supported = getExpectedScope(ScopeSupport.supportedButNotPresentInEditor);
const present = getExpectedScope(ScopeSupport.supportedAndPresentInEditor);
