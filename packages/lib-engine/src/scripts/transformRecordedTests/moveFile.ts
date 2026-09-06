import { mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { loadFixture } from "@cursorless/lib-node-common";

/**
 * Can be used to organize files into directories based on eg language id
 * @param file The file to move
 */
export async function moveFile(file: string) {
  const inputFixture = await loadFixture(file);
  const parent = path.dirname(file);
  if (path.basename(parent) !== "surroundingPair") {
    return;
  }
  const childDirName =
    inputFixture.languageId === "plaintext"
      ? "plaintext"
      : `parseTree/${inputFixture.languageId}`;
  const childDir = path.join(parent, childDirName);
  await mkdir(childDir, { recursive: true });
  const outputPath = path.join(childDir, path.basename(file));
  await rename(file, outputPath);
}
