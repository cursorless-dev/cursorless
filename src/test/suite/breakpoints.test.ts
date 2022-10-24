import * as assert from "assert";
import * as vscode from "vscode";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";
import { standardSuiteSetup } from "./standardSuiteSetup";

suite("breakpoints", async function () {
  standardSuiteSetup(this);

  setup(() => {
    removeBreakpoints();
  });

  suiteTeardown(() => {
    removeBreakpoints();
  });

  test("breakpoint harp add", breakpointHarpAdd);
  test("breakpoint token harp add", breakpointTokenHarpAdd);
  test("breakpoint harp remove", breakpointHarpRemove);
  test("breakpoint token harp remove", breakpointTokenHarpRemove);
});

async function breakpointHarpAdd() {
  const graph = (await getCursorlessApi()).graph!;
  await openNewEditor("  hello");
  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    "cursorless.command",
    "breakpoint harp",
    "setBreakpoint",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    ],
  );

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

async function breakpointTokenHarpAdd() {
  const graph = (await getCursorlessApi()).graph!;
  await openNewEditor("  hello");
  await graph.hatTokenMap.addDecorations();

  await vscode.commands.executeCommand(
    "cursorless.command",
    "breakpoint token harp",
    "setBreakpoint",
    [
      {
        type: "primitive",
        selectionType: "token",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    ],
  );

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 2, 0, 7)));
}

async function breakpointHarpRemove() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("  hello");
  await graph.hatTokenMap.addDecorations();

  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 0, 0, 0)),
    ),
  ]);

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 1);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "breakpoint harp",
    "setBreakpoint",
    [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    ],
  );

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 0);
}

async function breakpointTokenHarpRemove() {
  const graph = (await getCursorlessApi()).graph!;
  const editor = await openNewEditor("  hello");
  await graph.hatTokenMap.addDecorations();

  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 0, 0, 0)),
    ),
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 2, 0, 7)),
    ),
  ]);

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 2);

  await vscode.commands.executeCommand(
    "cursorless.command",
    "breakpoint token harp",
    "setBreakpoint",
    [
      {
        type: "primitive",
        selectionType: "token",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    ],
  );

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

function removeBreakpoints() {
  vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
}
