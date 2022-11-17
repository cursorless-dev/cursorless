import { Range, TextDocument } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { compositionRoot } from "./compositionRoot";
import {
  CursorlessApi,
  getCommandServerApi,
  getParseTreeApi,
} from "./libs/vscode-common/getExtensionApi";
import isTesting from "./testUtil/isTesting";

/**
 * Extension entrypoint called by VSCode on Cursorless startup.
 * - Creates a dependency container {@link Graph} with the components that
 * implement Cursorless.
 * - Creates test case recorder {@link TestCaseRecorder} for contributors to
 * use to record test cases.
 * - Creates an entrypoint for running commands {@link CommandRunner}.
 */
export async function activate(
  context: vscode.ExtensionContext,
): Promise<CursorlessApi> {
  const parseTreeApi = await getParseTreeApi();
  const commandServerApi = await getCommandServerApi();

  const getNodeAtLocation = (document: TextDocument, range: Range) => {
    return parseTreeApi.getNodeAtLocation(
      new vscode.Location(document.uri, toVscodeRange(range)),
    );
  };

  const { thatMark, sourceMark, snippets, plainObjectToTarget } =
    await compositionRoot(context, commandServerApi, getNodeAtLocation);

  return {
    thatMark,
    sourceMark,
    testHelpers: isTesting()
      ? {
          // FIXME: Remove this once we have a better way to get this function
          // accessible from our
          plainObjectToTarget,
        }
      : undefined,

    experimental: {
      registerThirdPartySnippets: snippets.registerThirdPartySnippets,
    },
  };
}

// this method is called when your extension is deactivated
export function deactivate() {
  // do nothing
}
