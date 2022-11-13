import * as vscode from "vscode";
import Position from "../../libs/common/ide/Position";
import { Range } from "../../libs/common/ide";
import { Selection } from "../../libs/common/ide";
import { EndOfLine } from "../../libs/common/ide/types/ide.types";
import TextDocument from "../../libs/common/ide/types/TextDocument";
import { TextEditor } from "../../libs/common/ide/types/TextEditor";
import TextLine from "../../libs/common/ide/types/TextLine";
import VscodeTextDocumentImpl from "./VscodeTextDocumentImpl";
import VscodeTextEditorImpl from "./VscodeTextEditorImpl";
import VscodeTextLineImpl from "./VscodeTextLineImpl";

export function toVscodeRange(range: Range): vscode.Range {
  return new vscode.Range(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function fromVscodeRange(range: vscode.Range): Range {
  return new Range(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function toVscodeSelection(range: Selection): vscode.Selection {
  return new vscode.Selection(
    range.anchor.line,
    range.anchor.character,
    range.active.line,
    range.active.character,
  );
}

export function fromVscodeSelection(range: vscode.Selection): Selection {
  return new Selection(
    range.anchor.line,
    range.anchor.character,
    range.active.line,
    range.active.character,
  );
}

export function toVscodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character);
}

export function fromVscodePosition(position: vscode.Position): Position {
  return new Position(position.line, position.character);
}

export function toVscodePositionOrRange(
  location: Position | Range,
): vscode.Position | vscode.Range {
  return "start" in location
    ? toVscodeRange(location)
    : toVscodePosition(location);
}

export function toVscodePositionOrRangeOrSelection(
  location: Position | Range | Selection,
): vscode.Position | vscode.Range | vscode.Selection {
  return "line" in location
    ? toVscodePosition(location)
    : toVscodeRangeOrSelection(location);
}

export function toVscodeRangeOrSelection(
  location: Range | Selection,
): vscode.Range | vscode.Selection {
  return "anchor" in location
    ? toVscodeSelection(location)
    : toVscodeRange(location);
}

export function fromVscodeTextLine(line: vscode.TextLine): TextLine {
  return new VscodeTextLineImpl(line);
}

export function toVscodeEndOfLine(eol: EndOfLine): vscode.EndOfLine {
  return eol === "LF" ? vscode.EndOfLine.LF : vscode.EndOfLine.CRLF;
}

export function fromVscodeAndOfLine(eol: vscode.EndOfLine): EndOfLine {
  return eol === vscode.EndOfLine.LF ? "LF" : "CRLF";
}

export function fromVscodeEditor(editor: vscode.TextEditor): TextEditor {
  return new VscodeTextEditorImpl(editor);
}

export function toVscodeEditor(editor: TextEditor): vscode.TextEditor {
  if ("vscodeEditor" in editor) {
    return (editor as VscodeTextEditorImpl).vscodeEditor;
  }
  throw Error("Can't get vscode editor from non vscode implementation");
}

export function fromVscodeDocument(
  document: vscode.TextDocument,
): TextDocument {
  return new VscodeTextDocumentImpl(document);
}
