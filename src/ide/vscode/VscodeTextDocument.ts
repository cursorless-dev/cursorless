import * as vscode from "vscode";
import { URI } from "vscode-uri";
import Range from "../../libs/common/ide/types/Range";
import Selection from "../../libs/common/ide/types/Selection";
import TextDocument from "../../libs/common/ide/types/TextDocument";

export default class VscodeTextDocument implements TextDocument {
  constructor(private editor: vscode.TextDocument) {}

  uri: URI;
  languageId: string;
  eol: "LF" | "CRLF";
  range: Range;
}
