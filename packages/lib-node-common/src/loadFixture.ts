import fsp from "node:fs/promises";
import { load } from "js-yaml";
import type { TestCaseFixtureLegacy } from "@cursorless/lib-common";

export function loadFixture(file: string): Promise<TestCaseFixtureLegacy> {
  return loadYamlFile<TestCaseFixtureLegacy>(file);
}

async function loadYamlFile<T>(file: string): Promise<T> {
  const buffer = await fsp.readFile(file);
  return load(buffer.toString()) as T;
}
