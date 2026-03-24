import * as fs from "node:fs/promises";
import * as yaml from "js-yaml";
import type { TestCaseFixture } from "@cursorless/lib-common";
import { serializeTestFixture } from "@cursorless/lib-common";
import type { FixtureTransformation } from "./types";

export async function transformFile(
  transformation: FixtureTransformation,
  file: string,
) {
  const buffer = await fs.readFile(file);
  const inputFixture = yaml.load(buffer.toString()) as TestCaseFixture;
  const outputFixture = transformation(inputFixture);
  if (outputFixture != null) {
    await fs.writeFile(file, serializeTestFixture(outputFixture));
  }
}
