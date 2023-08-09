import {
  getCursorlessApi,
  openNewEditor,
  runCursorlessCommand,
} from "@cursorless/vscode-common";
import * as assert from "assert";
import * as vscode from "vscode";
import { endToEndTestSetup } from "../endToEndTestSetup";

suite("breakpoints", async function () {
  endToEndTestSetup(this);

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
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  await openNewEditor("  hello");
  await hatTokenMap.allocateHats();

  await runCursorlessCommand({
    version: 1,
    action: "setBreakpoint",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    ],
  });

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

async function breakpointTokenHarpAdd() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  await openNewEditor("  hello");
  await hatTokenMap.allocateHats();

  await runCursorlessCommand({
    version: 1,
    action: "setBreakpoint",
    targets: [
      {
        type: "primitive",
        selectionType: "token",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    ],
  });

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 2, 0, 7)));
}

async function breakpointHarpRemove() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const editor = await openNewEditor("  hello");
  await hatTokenMap.allocateHats();

  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 0, 0, 0)),
    ),
  ]);

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 1);

  await runCursorlessCommand({
    version: 1,
    action: "setBreakpoint",
    targets: [
      {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    ],
  });

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 0);
}

async function breakpointTokenHarpRemove() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const editor = await openNewEditor("  hello");
  await hatTokenMap.allocateHats();

  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 0, 0, 0)),
    ),
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 2, 0, 7)),
    ),
  ]);

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 2);

  await runCursorlessCommand({
    version: 1,
    action: "setBreakpoint",
    targets: [
      {
        type: "primitive",
        selectionType: "token",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    ],
  });

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

function removeBreakpoints() {
  vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
}
