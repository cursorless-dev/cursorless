import { Range } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeToggleBreakpoint(
  editor: VscodeTextEditorImpl,
  ranges: Range[] | undefined,
): Promise<void> {
  const uri = editor.document.uri;
  const toAdd: vscode.Breakpoint[] = [];
  const toRemove: vscode.Breakpoint[] = [];
  const actualRanges = ranges ?? editor.selections;

  actualRanges.forEach((range) => {
    const vscodeRange = toVscodeRange(range);
    const existing = getBreakpoints(uri, vscodeRange);
    if (existing.length > 0) {
      toRemove.push(...existing);
    } else {
      toAdd.push(
        new vscode.SourceBreakpoint(new vscode.Location(uri, vscodeRange)),
      );
    }
  });

  vscode.debug.addBreakpoints(toAdd);
  vscode.debug.removeBreakpoints(toRemove);
}

function getBreakpoints(uri: vscode.Uri, range: vscode.Range) {
  return vscode.debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof vscode.SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      breakpoint.location.range.intersection(range) != null,
  );
}
