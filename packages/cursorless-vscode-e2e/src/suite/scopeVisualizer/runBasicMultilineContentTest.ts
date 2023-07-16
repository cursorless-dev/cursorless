import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { checkAndResetFakes } from "./checkAndResetFakes";
import { injectFakes } from "./injectFakes";
import { ExpectedArgs } from "./scopeVisualizerTest.types";

/**
 * Tests that the scope visualizer works with multiline content, by
 * ensuring that the correct decorations are applied so that it looks
 * like `./runBasicMultilineContentTest.png`.
 */
export async function runBasicMultilineContentTest() {
  await openNewEditor(contents, {
    languageId: "typescript",
  });

  const fakes = await injectFakes();

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "namedFunction",
    },
    "content",
  );

  checkAndResetFakes(fakes, expectedArgs);
}

const contents = `
function helloWorld() {

}
`;

const expectedArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderStyle: "solid dashed dashed solid",
      borderRadius: "2px 0px 0px 0px",
      isWholeLine: false,
      id: 0,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "none dashed none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 1,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderStyle: "dashed solid solid dashed",
      borderRadius: "0px 0px 2px 0px",
      isWholeLine: false,
      id: 2,
    },
  ],
  decorationRanges: [
    {
      decorationId: 0,
      ranges: [
        { start: { line: 1, character: 0 }, end: { line: 1, character: 23 } },
      ],
    },
    {
      decorationId: 1,
      ranges: [
        { start: { line: 2, character: 0 }, end: { line: 2, character: 0 } },
      ],
    },
    {
      decorationId: 2,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 1 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};
