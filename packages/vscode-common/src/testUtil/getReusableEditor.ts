import {
  commands,
  EndOfLine,
  languages,
  Range,
  window,
  type TextEditor,
} from "vscode";
import { getCursorlessApi, getParseTreeApi } from "../getExtensionApi";
import { closeUiElements } from "./closeUiElements";
import { openNewEditor } from "./openNewEditor";

let editor: TextEditor | undefined;

export async function getReusableEditor(
  content: string,
  languageId = "plaintext",
  openBeside = false,
): Promise<TextEditor> {
  await closeUiElements();

  if (openBeside) {
    return await openNewEditor(content, languageId, true);
  }

  if (editor == null) {
    editor = await openNewEditor(content, languageId);
    return editor;
  }

  (await getCursorlessApi()).testHelpers!.clearCache();

  // If the editor is not already active, make it active and close all other editors
  if (editor !== window.activeTextEditor) {
    editor = await window.showTextDocument(editor.document);
    // Close other groups
    await commands.executeCommand("workbench.action.closeEditorsInOtherGroups");
    // Close other editors in the same group
    await commands.executeCommand("workbench.action.closeOtherEditors");
  }

  // If the editor is not already the right language, change its language and reload the parse tree
  if (editor.document.languageId !== languageId) {
    await languages.setTextDocumentLanguage(editor.document, languageId);
    await (await getParseTreeApi()).loadLanguage(languageId);
  }

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
