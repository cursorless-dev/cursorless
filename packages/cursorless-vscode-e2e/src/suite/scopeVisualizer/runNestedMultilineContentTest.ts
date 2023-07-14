import { openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { injectFakes } from "./injectFakes";
import { checkAndResetFakes } from "./checkAndResetFakes";
import { ExpectedArgs } from "./scopeVisualizerTest.types";

/**
 * Tests that the scope visualizer works with nested multiline content, by
 * ensuring that the correct decorations are applied so that it looks as
 * follows:
 *
 * ![nested multiline content](./runNestedMultilineContentTest.png)
 */
export async function runNestedMultilineContentTest() {
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
function a() {
  function b() {

  }
}
`;

const expectedArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderStyle: "solid dashed none solid",
      borderRadius: "2px 0px 0px 0px",
      isWholeLine: false,
      id: 0,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "none none dashed dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 1,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "dashed dashed dashed none",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 2,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "none dashed none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 3,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "dashed none none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 4,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010002c0 #010001c0",
      borderStyle: "dashed dashed solid none",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 5,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderStyle: "none solid solid dashed",
      borderRadius: "0px 0px 2px 0px",
      isWholeLine: false,
      id: 6,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderStyle: "solid dashed dashed solid",
      borderRadius: "2px 0px 0px 0px",
      isWholeLine: false,
      id: 7,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "solid dashed none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
      id: 8,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderStyle: "dashed solid solid dashed",
      borderRadius: "0px 0px 2px 0px",
      isWholeLine: false,
      id: 9,
    },
  ],
  decorationRanges: [
    {
      decorationId: 0,
      ranges: [
        { start: { line: 1, character: 0 }, end: { line: 1, character: 14 } },
      ],
    },
    {
      decorationId: 1,
      ranges: [
        { start: { line: 2, character: 0 }, end: { line: 2, character: 14 } },
      ],
    },
    {
      decorationId: 2,
      ranges: [
        { start: { line: 2, character: 14 }, end: { line: 2, character: 16 } },
      ],
    },
    {
      decorationId: 3,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 0 } },
      ],
    },
    {
      decorationId: 4,
      ranges: [
        { start: { line: 4, character: 0 }, end: { line: 4, character: 1 } },
      ],
    },
    {
      decorationId: 5,
      ranges: [
        { start: { line: 4, character: 1 }, end: { line: 4, character: 3 } },
      ],
    },
    {
      decorationId: 6,
      ranges: [
        { start: { line: 5, character: 0 }, end: { line: 5, character: 1 } },
      ],
    },
    {
      decorationId: 7,
      ranges: [
        { start: { line: 2, character: 2 }, end: { line: 2, character: 16 } },
      ],
    },
    {
      decorationId: 8,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 0 } },
      ],
    },
    {
      decorationId: 9,
      ranges: [
        { start: { line: 4, character: 0 }, end: { line: 4, character: 3 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};
