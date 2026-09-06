import { fake } from "sinon";
import { Position, commands } from "vscode";
import type { ScopeSupportInfo } from "@cursorless/lib-common";
import { ScopeSupport } from "@cursorless/lib-common";
import { getTestHelpers, openNewEditor } from "@cursorless/lib-vscode-common";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple surrounding pair.
 */
export async function runSurroundingPairScopeInfoTest() {
  const { scopeProvider } = await getTestHelpers();
  const faked = fake<[scopeInfos: ScopeSupportInfo[]], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(faked);

  try {
    await assertCalledWithScopeInfo(faked, unsupported);

    const editor = await openNewEditor("");
    await assertCalledWithScopeInfo(faked, supported);

    await editor.edit((editBuilder) => {
      editBuilder.insert(new Position(0, 0), "()");
    });
    await assertCalledWithScopeInfo(faked, present);

    await commands.executeCommand("workbench.action.closeAllEditors");
    await assertCalledWithScopeInfo(faked, unsupported);
  } finally {
    disposable.dispose();
  }
}

function getExpectedScope(scopeSupport: ScopeSupport): ScopeSupportInfo {
  return {
    humanReadableName: "Matching pair of parentheses",
    isLanguageSpecific: false,
    iterationScopeSupport: scopeSupport,
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
