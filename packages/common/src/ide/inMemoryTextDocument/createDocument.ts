import { URI } from "vscode-uri";
import { InMemoryTextDocument } from "./InMemoryTextDocument";

export function createDocument(text: string): InMemoryTextDocument {
  return new InMemoryTextDocument(
    URI.parse("cursorless-dummy://dummy/untitled"),
    "plaintext",
    text,
  );
}
