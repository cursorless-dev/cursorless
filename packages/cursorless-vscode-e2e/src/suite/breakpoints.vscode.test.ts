import { LATEST_VERSION } from "@cursorless/common";
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

  test("breakpoint harp add", breakpointAdd);
  test("breakpoint token harp add", breakpointTokenAdd);
  test("breakpoint harp remove", breakpointRemove);
  test("breakpoint token harp remove", breakpointTokenRemove);
});

async function breakpointAdd() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  await openNewEditor("  hello");
  await hatTokenMap.allocateHats();
  await toggleBreakpoint();

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

async function breakpointTokenAdd() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  await openNewEditor("  hello");
  await hatTokenMap.allocateHats();
  await toggleTokenBreakpoint();

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 2, 0, 7)));
}

async function breakpointRemove() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;
  const editor = await openNewEditor("  hello");
  await hatTokenMap.allocateHats();

  vscode.debug.addBreakpoints([
    new vscode.SourceBreakpoint(
      new vscode.Location(editor.document.uri, new vscode.Range(0, 0, 0, 0)),
    ),
  ]);

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 1);

  await toggleBreakpoint();

  assert.deepStrictEqual(vscode.debug.breakpoints.length, 0);
}

async function breakpointTokenRemove() {
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

  await toggleTokenBreakpoint();

  const breakpoints = vscode.debug.breakpoints;
  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

function removeBreakpoints() {
  vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
}

function toggleTokenBreakpoint() {
  return runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "toggleLineBreakpoint",
      target: {
        type: "primitive",
        modifiers: [{ type: "containingScope", scopeType: { type: "token" } }],
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    },
  });
}

function toggleBreakpoint() {
  return runCursorlessCommand({
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
    action: {
      name: "toggleLineBreakpoint",
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "e",
        },
      },
    },
  });
}
