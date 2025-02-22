import type { GeneralizedRange, Position } from "@cursorless/common";
import { toVscodePosition } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeToggleBreakpoint(
  editor: VscodeTextEditorImpl,
  ranges?: GeneralizedRange[] | undefined,
): Promise<void> {
  if (ranges == null) {
    return await vscode.commands.executeCommand(
      "editor.debug.action.toggleBreakpoint",
    );
  }

  const uri = editor.document.uri;
  const toAdd: vscode.Breakpoint[] = [];
  const toRemove: vscode.Breakpoint[] = [];

  ranges.forEach((range) => {
    const existing = getBreakpoints(uri, range);

    if (existing.length > 0) {
      toRemove.push(...existing);
    } else {
      toAdd.push(
        new vscode.SourceBreakpoint(
          new vscode.Location(
            uri,
            range.type === "line"
              ? new vscode.Range(range.start, 0, range.end, 0)
              : toVscodeRange(range.start, range.end),
          ),
        ),
      );
    }
  });

  vscode.debug.addBreakpoints(toAdd);
  vscode.debug.removeBreakpoints(toRemove);
}

function getBreakpoints(uri: vscode.Uri, range: GeneralizedRange) {
  let rangeInterceptPredicate: (range: vscode.Range) => boolean;

  if (range.type === "line") {
    rangeInterceptPredicate = ({ start, end }) =>
      range.start <= end.line && range.end >= start.line;
  } else {
    const descriptorRange = toVscodeRange(range.start, range.end);
    rangeInterceptPredicate = (range) =>
      range.intersection(descriptorRange) != null;
  }

  return vscode.debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof vscode.SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      rangeInterceptPredicate(breakpoint.location.range),
  );
}

function toVscodeRange(start: Position, end: Position): vscode.Range {
  return new vscode.Range(toVscodePosition(start), toVscodePosition(end));
}
