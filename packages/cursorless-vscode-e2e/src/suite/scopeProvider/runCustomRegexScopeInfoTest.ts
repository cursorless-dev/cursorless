import type {
  ScopeSupportInfo,
  ScopeType,
  SpokenFormEntry,
} from "@cursorless/common";
import { ScopeSupport, sleep } from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import { commands } from "vscode";
import {
  assertCalledWithScopeInfo,
  assertCalledWithoutScopeInfo,
} from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports custom spoken forms for
 * custom regex scopes.
 */
export async function runCustomRegexScopeInfoTest() {
  const { scopeProvider, talonSpokenForms } = (await getCursorlessApi())
    .testHelpers!;
  const fake = sinon.fake<[scopeInfos: ScopeSupportInfo[]], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    await assertCalledWithoutScopeInfo(fake, scopeType);

    talonSpokenForms.mockSpokenFormEntries(spokenFormEntries);
    await assertCalledWithScopeInfo(fake, unsupported);

    await openNewEditor(contents);
    // The scope provider relies on the open document event (among others) to
    // update available scopes. Add a short sleep here to give it time to
    // trigger.
    await sleep(100);
    await assertCalledWithScopeInfo(fake, present);

    talonSpokenForms.mockSpokenFormEntries(null);
    await assertCalledWithoutScopeInfo(fake, scopeType);
  } finally {
    disposable.dispose();
  }
}

const contents = `
hello world
`;

const regex = "[a-zA-Z]+";

const spokenFormEntries: SpokenFormEntry[] = [
  {
    type: "customRegex",
    id: regex,
    spokenForms: ["spaghetti"],
  },
];
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
      spokenForms: ["spaghetti"],
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const present = getExpectedScope(ScopeSupport.supportedAndPresentInEditor);
