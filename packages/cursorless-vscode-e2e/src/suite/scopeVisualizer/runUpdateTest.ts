import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { sleepWithBackoff } from "../../endToEndTestSetup";
import { injectFakes } from "./injectFakes";
import { checkAndResetFakes } from "./checkAndResetFakes";
import { ExpectedArgs } from "./scopeVisualizerTest.types";

/**
 * Tests that the scope visualizer updates correctly when the document is
 * edited.
 */
export async function runUpdateTest() {
  const editor = await openNewEditor("aaa");

  const fakes = await injectFakes();

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "token",
    },
    "content",
  );

  checkAndResetFakes(fakes, expectedInitialArgs);

  await editor.edit((editBuilder) => {
    editBuilder.insert(new vscode.Position(0, 3), " bbb");
  });
  await sleepWithBackoff(100);

  checkAndResetFakes(fakes, expectedUpdatedArgs);

  await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");

  checkAndResetFakes(fakes, expectedFinalArgs);
}

const expectedInitialArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010002c0 #010002c0 #010002c0",
      borderStyle: "solid solid solid solid",
      borderRadius: "2px 2px 2px 2px",
      isWholeLine: false,
      id: 0,
    },
  ],
  decorationRanges: [
    {
      decorationId: 0,
      ranges: [
        { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};

const expectedUpdatedArgs: ExpectedArgs = {
  decorationRenderOptions: [],
  decorationRanges: [
    {
      decorationId: 0,
      ranges: [
        { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
        { start: { line: 0, character: 4 }, end: { line: 0, character: 7 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};

const expectedFinalArgs: ExpectedArgs = {
  decorationRenderOptions: [],
  decorationRanges: [],
  disposedDecorationIds: [0],
};
