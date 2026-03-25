import { readFile } from "node:fs/promises";
import * as yaml from "js-yaml";
import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";

export async function loadFixture(
  path: string,
): Promise<TestCaseFixtureLegacy> {
  const buffer = await readFile(path);
  return yaml.load(buffer.toString()) as TestCaseFixtureLegacy;
}
