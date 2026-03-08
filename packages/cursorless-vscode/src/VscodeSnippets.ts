import type { IDE, TextEditor } from "@cursorless/common";
import { type Snippets } from "@cursorless/cursorless-engine";
import { open } from "node:fs/promises";
import { join } from "node:path";

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
  } catch (e) {
    if (e instanceof Error && "code" in e && e.code === "EEXIST") {
      throw new Error(`Snippet file already exists: ${path}`, { cause: e });
    }
    throw e;
  }
}
