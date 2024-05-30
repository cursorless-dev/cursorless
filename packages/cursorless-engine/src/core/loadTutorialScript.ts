import { readFile } from "node:fs/promises";
import path from "path";
import { RawTutorialContent } from "../api/Tutorial";

/**
 * Load the "script.json" script for the current tutorial
 */
export async function loadTutorialScript(
  tutorialRootDir: string,
  tutorialName: string,
): Promise<RawTutorialContent> {
  const buffer = await readFile(
    path.join(tutorialRootDir, tutorialName, "script.json"),
  );

  return JSON.parse(buffer.toString());
}
