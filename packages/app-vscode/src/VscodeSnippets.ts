import { open } from "node:fs/promises";
import { join } from "node:path";
import type { IDE, TextEditor } from "@cursorless/lib-common";
import type { Snippets } from "@cursorless/lib-engine";
import { isEexistError } from "@cursorless/lib-node-common";

export class VscodeSnippets implements Snippets {
  constructor(private ide: IDE) {}

  async openNewSnippetFile(
    snippetName: string,
    directory: string,
  ): Promise<TextEditor> {
    const snippetPath = join(directory, `${snippetName}.snippet`);
    await createNewFile(snippetPath);
    return this.ide.openTextDocument(snippetPath);
  }
}

async function createNewFile(path: string) {
  try {
    const file = await open(path, "wx");
    await file.close();
  } catch (error) {
    if (isEexistError(error)) {
      throw new Error(`Snippet file already exists: ${path}`, { cause: error });
    }
    throw error;
  }
}
