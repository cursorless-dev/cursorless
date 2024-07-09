import { open } from "fs/promises";
import { join } from "pathe";
import { ide } from "../../singletons/ide.singleton";

/**
 * Creates a new empty file in the users snippet directory and opens an editor
 * onto that file.
 * @param snippetName The name of the snippet
 */
export async function openNewSnippetFile(snippetName: string) {
  const userSnippetsDir = ide().configuration.getOwnConfiguration(
    "experimental.snippetsDir",
  );

  if (!userSnippetsDir) {
    throw new Error("User snippets dir not configured.");
  }

  const path = join(userSnippetsDir, `${snippetName}.cursorless-snippets`);
  await touch(path);
  await ide().openTextDocument(path);
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
