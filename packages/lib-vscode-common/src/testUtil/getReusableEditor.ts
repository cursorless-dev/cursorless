import { EndOfLine, Range, window, type TextEditor } from "vscode";
import { getCursorlessApi } from "../getExtensionApi";
import { closeUiElements } from "./closeUiElements";
import { openNewEditor } from "./openNewEditor";

let editor: TextEditor | undefined;

export async function getReusableEditor(
  content: string,
  languageId = "plaintext",
): Promise<TextEditor> {
  // Current editor is not fit for purpose, open a new one
  if (
    editor == null ||
    editor !== window.activeTextEditor ||
    editor.document.languageId !== languageId
  ) {
    editor = await openNewEditor(content, languageId);
    return editor;
  }

  await closeUiElements();
  (await getCursorlessApi()).testHelpers!.clearCache();

  // Replace the entire contents of the editor with the new content
  await editor.edit((editBuilder) => {
    editBuilder.replace(
      new Range(
        editor!.document.lineAt(0).range.start,
        editor!.document.lineAt(editor!.document.lineCount - 1).range.end,
      ),
      content,
    );

    const eol = content.includes("\r\n") ? EndOfLine.CRLF : EndOfLine.LF;
    if (eol !== editor!.document.eol) {
      editBuilder.setEndOfLine(eol);
    }
  });

  return editor;
}

export function resetReusableEditor() {
  editor = undefined;
}
