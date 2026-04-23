import { promises as fsp } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import * as path from "node:path";
import * as yaml from "js-yaml";
import type { TestCaseFixture } from "@cursorless/lib-common";

/**
 * Can be used to organize files into directories based on eg language id
 * @param file The file to move
 */
export async function moveFile(file: string) {
  const buffer = await fsp.readFile(file);
  const inputFixture = yaml.load(buffer.toString()) as TestCaseFixture;
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
