import type { ScopeSupportInfo } from "@cursorless/common";
import { ScopeSupport } from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import type { TextDocument } from "vscode";
import { Position, Range, commands } from "vscode";
import { assertCalledWithScopeInfo } from "./assertCalledWithScopeInfo";

/**
 * Tests that the scope provider correctly reports the scope support for a
 * simple named function.
 */
export async function runBasicScopeInfoTest() {
  const { scopeProvider } = (await getCursorlessApi()).testHelpers!;
  const fake = sinon.fake<[scopeInfos: ScopeSupportInfo[]], void>();

  await commands.executeCommand("workbench.action.closeAllEditors");

  const disposable = scopeProvider.onDidChangeScopeSupport(fake);

  try {
    await assertCalledWithScopeInfo(fake, unsupported);

    const editor = await openNewEditor("", {
      languageId: "typescript",
    });
    await assertCalledWithScopeInfo(fake, supported);

    await editor.edit((editBuilder) => {
      editBuilder.insert(new Position(0, 0), contents);
    });
    await assertCalledWithScopeInfo(fake, present);

    await editor.edit((editBuilder) => {
      editBuilder.delete(getDocumentRange(editor.document));
    });
    await assertCalledWithScopeInfo(fake, supported);

    await commands.executeCommand("workbench.action.closeAllEditors");
    await assertCalledWithScopeInfo(fake, unsupported);
  } finally {
    disposable.dispose();
  }
}

function getDocumentRange(textDocument: TextDocument) {
  const { end } = textDocument.lineAt(textDocument.lineCount - 1).range;
  return new Range(0, 0, end.line, end.character);
}

const contents = `
function helloWorld() {

}
`;

function getExpectedScope(
  scopeSupport: ScopeSupport,
  iterationScopeSupport?: ScopeSupport,
): ScopeSupportInfo {
  return {
    humanReadableName: "named function",
    isLanguageSpecific: true,
    iterationScopeSupport: iterationScopeSupport ?? scopeSupport,
    scopeType: {
      type: "namedFunction",
    },
    spokenForm: {
      spokenForms: ["funk"],
      type: "success",
    },
    support: scopeSupport,
  };
}

const unsupported = getExpectedScope(ScopeSupport.unsupported);
const supported = getExpectedScope(
  ScopeSupport.supportedButNotPresentInEditor,
  ScopeSupport.supportedAndPresentInEditor,
);
const present = getExpectedScope(ScopeSupport.supportedAndPresentInEditor);
