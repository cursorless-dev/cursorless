import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { checkAndResetFakes } from "./checkAndResetFakes";
import { injectFakes } from "./injectFakes";
import { ExpectedArgs } from "./scopeVisualizerTest.types";

export async function runBasicRemovalTest() {
  await openNewEditor("aaa bbb");

  const fakes = await injectFakes();

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "token",
    },
    "removal",
  );

  checkAndResetFakes(fakes, expectedArgs);
}

const expectedArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#01000080",
      borderColor: "#03000080 #03000080 #03000080 #03000080",
      borderStyle: "solid solid solid solid",
      borderRadius: "2px 2px 2px 2px",
      isWholeLine: false,
      id: 0,
    },
    {
      backgroundColor: "#00010080",
      borderColor: "#00030080 #00030080 #00030080 #00030080",
      borderStyle: "solid solid solid solid",
      borderRadius: "2px 2px 2px 2px",
      isWholeLine: false,
      id: 1,
    },
    {
      backgroundColor: "#00010080",
      borderColor: "#00030080 #00030080 #00030080 #00030080",
      borderStyle: "solid solid solid solid",
      borderRadius: "2px 2px 2px 2px",
      isWholeLine: false,
      id: 2,
    },
  ],
  decorationRanges: [
    {
      decorationId: 0,
      ranges: [
        { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
        { start: { line: 0, character: 4 }, end: { line: 0, character: 7 } },
      ],
    },
    {
      decorationId: 1,
      ranges: [
        { start: { line: 0, character: 0 }, end: { line: 0, character: 4 } },
      ],
    },
    {
      decorationId: 2,
      ranges: [
        { start: { line: 0, character: 3 }, end: { line: 0, character: 7 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};
