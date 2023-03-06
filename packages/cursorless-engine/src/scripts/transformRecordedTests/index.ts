// Ensures that the aliases such as @cursorless/common that we define in
// package.json are active
// NOTE: This must be at the top!

import { getRecordedTestPaths } from "@cursorless/common";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import { FixtureTransformation } from "./types";
import { upgradeDecorations } from "./upgradeDecorations";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  autoFormat: identity,
  custom: upgradeDecorations,
};

async function main(transformationName: string | undefined) {
  const transformation =
    transformationName == null
      ? identity
      : AVAILABLE_TRANSFORMATIONS[transformationName];

  if (transformation == null) {
    throw new Error(`Unknown transformation ${transformationName}`);
  }

  getRecordedTestPaths().forEach((path) => transformFile(transformation, path));
}

main(process.argv[2]);
