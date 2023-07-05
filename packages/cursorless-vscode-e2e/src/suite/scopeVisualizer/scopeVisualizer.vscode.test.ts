import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import asyncSafety from "../../asyncSafety";
import { endToEndTestSetup, sleepWithBackoff } from "../../endToEndTestSetup";
import { injectFakes } from "./injectFakes";
import { checkAndResetFakes } from "./checkAndResetFakes";
import { ExpectedArgs } from "./scopeVisualizerTest.types";

suite("scope visualizer", async function () {
  endToEndTestSetup(this);

  test(
    "basic content",
    asyncSafety(() => runContentTest()),
  );
  // test(
  //   "basic removal",
  //   asyncSafety(() => runRemovalTest()),
  // );
});

const initialDocumentContents = `
function helloWorld() {

}
`;

const updatedDocumentContents = `
function helloWorld() {
  function nestedFunction() {

  }
}
`;

const expectedInitialArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderRadius: "2px 0px 0px 0px",
      borderStyle: "solid dashed dashed solid",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderRadius: "0px 0px 0px 0px",
      borderStyle: "none dashed none dashed",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderRadius: "0px 0px 2px 0px",
      borderStyle: "dashed solid solid dashed",
      isWholeLine: false,
    },
  ],
  decorationRanges: [
    {
      decorationType: 0,
      ranges: [
        { start: { line: 1, character: 0 }, end: { line: 1, character: 23 } },
      ],
    },
    {
      decorationType: 1,
      ranges: [
        { start: { line: 2, character: 0 }, end: { line: 2, character: 0 } },
      ],
    },
    {
      decorationType: 2,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 1 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};
const expectedUpdatedArgs: ExpectedArgs = {
  decorationRenderOptions: [
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderStyle: "solid dashed none solid",
      borderRadius: "2px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "none none dashed dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "dashed dashed dashed none",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "dashed none none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010001c0 #010002c0 #010001c0",
      borderStyle: "dashed dashed solid none",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderStyle: "none solid solid dashed",
      borderRadius: "0px 0px 2px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010002c0",
      borderStyle: "solid dashed dashed solid",
      borderRadius: "2px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010002c0 #010001c0 #010001c0 #010001c0",
      borderStyle: "solid dashed none dashed",
      borderRadius: "0px 0px 0px 0px",
      isWholeLine: false,
    },
    {
      backgroundColor: "#000001c0",
      borderColor: "#010001c0 #010002c0 #010002c0 #010001c0",
      borderStyle: "dashed solid solid dashed",
      borderRadius: "0px 0px 2px 0px",
      isWholeLine: false,
    },
  ],
  decorationRanges: [
    {
      decorationType: 3,
      ranges: [
        { start: { line: 1, character: 0 }, end: { line: 1, character: 23 } },
      ],
    },
    {
      decorationType: 4,
      ranges: [
        { start: { line: 2, character: 0 }, end: { line: 2, character: 23 } },
      ],
    },
    {
      decorationType: 5,
      ranges: [
        { start: { line: 2, character: 23 }, end: { line: 2, character: 29 } },
      ],
    },
    {
      decorationType: 1,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 0 } },
      ],
    },
    {
      decorationType: 6,
      ranges: [
        { start: { line: 4, character: 0 }, end: { line: 4, character: 1 } },
      ],
    },
    {
      decorationType: 7,
      ranges: [
        { start: { line: 4, character: 1 }, end: { line: 4, character: 3 } },
      ],
    },
    {
      decorationType: 8,
      ranges: [
        { start: { line: 5, character: 0 }, end: { line: 5, character: 1 } },
      ],
    },
    {
      decorationType: 9,
      ranges: [
        { start: { line: 2, character: 2 }, end: { line: 2, character: 29 } },
      ],
    },
    {
      decorationType: 10,
      ranges: [
        { start: { line: 3, character: 0 }, end: { line: 3, character: 0 } },
      ],
    },
    {
      decorationType: 11,
      ranges: [
        { start: { line: 4, character: 0 }, end: { line: 4, character: 3 } },
      ],
    },
  ],
  disposedDecorationIds: [],
};
const expectedFinalArgs: ExpectedArgs = {
  decorationRenderOptions: [],
  decorationRanges: [],
  disposedDecorationIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
};

async function runContentTest() {
  const editor = await openNewEditor(initialDocumentContents, {
    languageId: "typescript",
  });

  const { vscode: vscodeApi } = (await getCursorlessApi()).testHelpers!;

  const fakes = injectFakes(vscodeApi);

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "namedFunction",
    },
    "content",
  );

  checkAndResetFakes(fakes, expectedInitialArgs);

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(2, 1)),
      updatedDocumentContents,
    );
  });
  await sleepWithBackoff(100);

  checkAndResetFakes(fakes, expectedUpdatedArgs);

  await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");

  checkAndResetFakes(fakes, expectedFinalArgs);
}
