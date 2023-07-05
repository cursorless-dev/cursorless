import {
  PlainScopeVisualization,
  SpyIDE,
  omitByDeep,
  spyIDERecordedValuesToPlainObject,
} from "@cursorless/common";
import { openNewEditor } from "@cursorless/vscode-common";
import { assert } from "chai";
import asyncSafety from "../asyncSafety";
import { endToEndTestSetup, sleepWithBackoff } from "../endToEndTestSetup";
import * as vscode from "vscode";
import { isUndefined } from "lodash";

suite("scope visualizer", async function () {
  const { getSpy } = endToEndTestSetup(this);

  test(
    "basic content",
    asyncSafety(() => runContentTest(getSpy()!)),
  );
  test(
    "basic removal",
    asyncSafety(() => runRemovalTest(getSpy()!)),
  );
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

const expectedUpdatedContentVisualization = {};

async function runContentTest(spyIde: SpyIDE) {
  const editor = await openNewEditor(initialDocumentContents, {
    languageId: "typescript",
  });

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "namedFunction",
    },
    "content",
  );

  const expectedVisualizations = [...expectedInitialContentVisualizations];
  checkVisualizations(spyIde, expectedVisualizations);

  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new vscode.Range(new vscode.Position(0, 0), new vscode.Position(2, 1)),
      updatedDocumentContents,
    );
  });
  await sleepWithBackoff(100);

  expectedVisualizations.push(expectedUpdatedContentVisualization);
  checkVisualizations(spyIde, expectedVisualizations);

  await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");

  expectedVisualizations.push({ scopeRanges: [] });
  checkVisualizations(spyIde, expectedVisualizations);
}

const expectedRemovalVisualizations: any[] = [];

async function runRemovalTest(spyIde: SpyIDE) {
  await openNewEditor(initialDocumentContents, {
    languageId: "typescript",
  });

  await vscode.commands.executeCommand(
    "cursorless.showScopeVisualizer",
    {
      type: "paragraph",
    },
    "removal",
  );

  checkVisualizations(spyIde, expectedRemovalVisualizations);

  await vscode.commands.executeCommand("cursorless.hideScopeVisualizer");
}

function checkVisualizations(
  spyIde: SpyIDE,
  expectedVisualizations: PlainScopeVisualization[],
) {
  const actualVisualizations = omitByDeep(
    spyIDERecordedValuesToPlainObject(spyIde.getSpyValues(false)!)
      .scopeVisualizations,
    isUndefined,
  );

  assert.deepStrictEqual(
    actualVisualizations,
    expectedVisualizations,
    JSON.stringify(actualVisualizations),
  );
}
