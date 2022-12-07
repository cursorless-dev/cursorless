import { BreakpointDescriptor } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export async function vscodeToggleBreakpoint(
  editor: VscodeTextEditorImpl,
  descriptors: BreakpointDescriptor[] | undefined,
): Promise<void> {
  if (descriptors == null) {
    return await vscode.commands.executeCommand(
      "editor.debug.action.toggleBreakpoint",
    );
  }

  const uri = editor.document.uri;
  const toAdd: vscode.Breakpoint[] = [];
  const toRemove: vscode.Breakpoint[] = [];

  descriptors.forEach((descriptor) => {
    const existing = getBreakpoints(uri, descriptor);
    if (existing.length > 0) {
      toRemove.push(...existing);
    } else {
      toAdd.push(
        new vscode.SourceBreakpoint(
          new vscode.Location(
            uri,
            descriptor.type === "line"
              ? new vscode.Range(descriptor.startLine, 0, descriptor.endLine, 0)
              : toVscodeRange(descriptor.range),
          ),
        ),
      );
    }
  });

  vscode.debug.addBreakpoints(toAdd);
  vscode.debug.removeBreakpoints(toRemove);
}

function getBreakpoints(uri: vscode.Uri, descriptor: BreakpointDescriptor) {
  let rangeInterceptsDescriptor: (range: vscode.Range) => boolean;

  if (descriptor.type === "line") {
    rangeInterceptsDescriptor = ({ start, end }) =>
      descriptor.startLine <= end.line && descriptor.endLine >= start.line;
  } else {
    const descriptorRange = toVscodeRange(descriptor.range);
    rangeInterceptsDescriptor = (range) =>
      range.intersection(descriptorRange) != null;
  }

  return vscode.debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof vscode.SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      rangeInterceptsDescriptor(breakpoint.location.range),
  );
}
