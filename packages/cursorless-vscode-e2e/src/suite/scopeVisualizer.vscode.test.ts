import {
  ScopeVisualizerColorConfig,
  Vscode,
  getCursorlessApi,
  openNewEditor,
} from "@cursorless/vscode-common";
import { assert } from "chai";
import * as sinon from "sinon";
import * as vscode from "vscode";
import {
  DecorationRenderOptions,
  TextEditorDecorationType,
  WorkspaceConfiguration,
} from "vscode";
import asyncSafety from "../asyncSafety";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import { rangeToPlainObject } from "@cursorless/common";

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

const expectedInitialContentVisualizations: any[] = [];

const expectedUpdatedContentVisualization: any[] = [];

const COLOR_CONFIG: ScopeVisualizerColorConfig = {
  dark: {
    content: {
      background: "#000000",
      borderPorous: "#000001",
      borderSolid: "#000002",
    },
    domain: {
      background: "#000003",
      borderPorous: "#000004",
      borderSolid: "#000005",
    },
    iteration: {
      background: "#000006",
      borderPorous: "#000007",
      borderSolid: "#000008",
    },
    removal: {
      background: "#000009",
      borderPorous: "#000010",
      borderSolid: "#000011",
    },
  },
  light: {
    content: {
      background: "#100000",
      borderPorous: "#100001",
      borderSolid: "#100002",
    },
    domain: {
      background: "#100003",
      borderPorous: "#100004",
      borderSolid: "#100005",
    },
    iteration: {
      background: "#100006",
      borderPorous: "#100007",
      borderSolid: "#100008",
    },
    removal: {
      background: "#100009",
      borderPorous: "#100010",
      borderSolid: "#100011",
    },
  },
};

async function runContentTest() {
  const editor = await openNewEditor(initialDocumentContents, {
    languageId: "typescript",
  });

  const { vscode: vscodeApi } = (await getCursorlessApi()).testHelpers!;

  let decorationIndex = 0;
  const setDecorations = sinon.fake<
    Parameters<Vscode["editor"]["setDecorations"]>,
    void
  >();
  const getConfigurationValue = sinon.fake.returns(COLOR_CONFIG);
  const dispose = sinon.fake();
  const createTextEditorDecorationType = sinon.fake(
    (_options: DecorationRenderOptions) => {
      return {
        dispose,
        id: decorationIndex++,
      } as unknown as TextEditorDecorationType;
    },
  );

  sinon.replace(
    vscodeApi.window,
    "createTextEditorDecorationType",
    createTextEditorDecorationType,
  );
  sinon.replace(vscodeApi.editor, "setDecorations", setDecorations);
  sinon.replace(
    vscodeApi.workspace,
    "getConfiguration",
    sinon.fake.returns({
      get: getConfigurationValue,
    } as unknown as WorkspaceConfiguration),
  );

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "namedFunction",
    },
    "content",
  );

  checkAndResetDecorations(
    setDecorations,
    expectedInitialContentVisualizations,
  );

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(2, 1)),
      updatedDocumentContents,
    );
  });
  await sleepWithBackoff(100);

  checkAndResetDecorations(setDecorations, expectedUpdatedContentVisualization);

  await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");

  checkAndResetDecorations(setDecorations, []);
}

// const expectedRemovalVisualizations = [];

// async function runRemovalTest() {
//   await openNewEditor(initialDocumentContents, {
//     languageId: "typescript",
//   });

//   await vscode.commands.executeCommand(
//     "cursorless.showScopeVisualizer",
//     {
//       type: "paragraph",
//     },
//     "removal",
//   );

//   checkDecorations(spyIde, expectedRemovalVisualizations);

//   await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");
// }

function checkAndResetDecorations(
  setDecorations: sinon.SinonSpy<
    Parameters<Vscode["editor"]["setDecorations"]>,
    void
  >,
  expectedDecorations: any[],
) {
  const actualDecorations = setDecorations.args.map((args) =>
    setDecorationsArgsToPlainObject(...(args as [any, any, any])),
  );
  assert.deepStrictEqual(
    actualDecorations,
    expectedDecorations,
    JSON.stringify(actualDecorations),
  );
  setDecorations.resetHistory();
}

function setDecorationsArgsToPlainObject(
  _editor: vscode.TextEditor,
  decorationType: { id: string },
  ranges: readonly vscode.Range[],
): any {
  return {
    decorationType: decorationType.id,
    ranges: ranges.map(rangeToPlainObject),
  };
}
