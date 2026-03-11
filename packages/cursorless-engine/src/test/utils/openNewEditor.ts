import {
  InMemoryTextDocument,
  Selection,
  type EditableTextEditor,
} from "@cursorless/common";
import { URI } from "vscode-uri";
import { TestEditor } from "./TestEditor";

let nextId = 0;

export async function openNewEditor(
  content: string,
  languageId: string,
): Promise<EditableTextEditor> {
  const id = String(nextId++);
  const uri = URI.parse(`talon-js://${id}`);
  const document = new InMemoryTextDocument(uri, languageId, content);
  const visibleRanges = [document.range];
  const selections = [new Selection(0, 0, 0, 0)];
  return new TestEditor(id, document, visibleRanges, selections);
}
