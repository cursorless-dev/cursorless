import { open } from "fs/promises";
import { join } from "path";
import { window, workspace } from "vscode";

/**
 * Creates a new empty file in the users snippet directory and opens an editor
 * onto that file.
 * @param snippetName The name of the snippet
 */
export async function openNewSnippetFile(snippetName: string) {
  const userSnippetsDir = workspace
    .getConfiguration("cursorless.experimental")
    .get<string>("snippetsDir");

  if (!userSnippetsDir) {
    throw new Error("User snippets dir not configured.");
  }

  const path = join(userSnippetsDir, `${snippetName}.cursorless-snippets`);
  await touch(path);
  const snippetDoc = await workspace.openTextDocument(path);
  await window.showTextDocument(snippetDoc);
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
