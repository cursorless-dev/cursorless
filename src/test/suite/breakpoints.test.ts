import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import { getCursorlessApi } from "../../util/getExtensionApi";
import { openNewEditor } from "../openNewEditor";

suite("breakpoints", async function () {
  this.timeout("100s");
  this.retries(3);

  teardown(() => {
    sinon.restore();
  });

  test("breakpoint harp", breakpointHarp);
  test("breakpoint token harp", breakpointTokenHarp);
});

async function breakpointHarp() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewEditor("  hello");

  await graph.hatTokenMap.addDecorations();

  removeBreakpoints();

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
    ]
  );

  const breakpoints = vscode.debug.breakpoints;

  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = <vscode.SourceBreakpoint>breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 0, 0, 0)));
}

async function breakpointTokenHarp() {
  const graph = (await getCursorlessApi()).graph!;

  await openNewEditor("  hello");

  await graph.hatTokenMap.addDecorations();

  removeBreakpoints();

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
    ]
  );

  const breakpoints = vscode.debug.breakpoints;

  assert.deepStrictEqual(breakpoints.length, 1);
  assert.ok(breakpoints[0] instanceof vscode.SourceBreakpoint);
  const breakpoint = <vscode.SourceBreakpoint>breakpoints[0];
  assert.ok(breakpoint.location.range.isEqual(new vscode.Range(0, 2, 0, 7)));
}

function removeBreakpoints() {
  vscode.debug.removeBreakpoints(vscode.debug.breakpoints);
}
