import * as assert from "assert";
import * as vscode from "vscode";
import { runCursorlessCommand } from "../../core/commandRunner/CommandRunner";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("Backward compatibility", async function () {
  standardSuiteSetup(this);

  test("Backward compatibility", runTest);
});

async function runTest() {
  const graph = (await getCursorlessApi()).graph!;

  const editor = await openNewEditor("");

  editor.selections = [new vscode.Selection(0, 0, 0, 0)];

  await graph.hatTokenMap.addDecorations();

  await runCursorlessCommand({
    version: 1,
    action: "wrapWithPairedDelimiter",
    extraArgs: ["(", ")"],
    targets: [
      {
        type: "primitive",
        selectionType: "line",
        mark: { type: "cursor" },
      },
    ],
  });

  assert.deepStrictEqual(editor.document.getText(), "()");
}
