import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import {
  ScopeSupport,
  ScopeSupportInfo,
  ScopeSupportLevels,
} from "@cursorless/common";
import * as sinon from "sinon";
import { commands } from "vscode";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple surrounding pair.
 */
export async function runSurroundingPairScopeInfoTest() {
  const { scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const fake = sinon.fake<[scopeInfos: ScopeSupportLevels], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    await assertCalledWithScopeInfo(fake, unsupported);

    await openNewEditor("");
    await assertCalledWithScopeInfo(fake, legacy);

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
      alternatives: [],
      preferred: "round",
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const legacy = getExpectedScope(ScopeSupport.supportedLegacy);
