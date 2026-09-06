import fs from "node:fs/promises";
import { serializeTestFixture } from "@cursorless/lib-common";
import { loadFixture } from "@cursorless/lib-node-common";
import type { FixtureTransformation } from "./types";

export async function transformFile(
  transformation: FixtureTransformation,
  file: string,
) {
  const inputFixture = await loadFixture(file);
  const outputFixture = transformation(inputFixture);
  if (outputFixture != null) {
    await fs.writeFile(file, serializeTestFixture(outputFixture));
  }
}
