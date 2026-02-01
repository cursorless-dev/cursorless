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
    const path = join(directory, `${snippetName}.snippet`);
    await touch(path);
    return this.ide.openTextDocument(path);
  }
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
