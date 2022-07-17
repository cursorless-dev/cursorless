import { getRecordedTestPaths } from "../../test/util/getFixturePaths";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import type { FixtureTransformation } from "./types";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  autoFormat: identity,
  // custom: MY_CUSTOM_TRANSFORMER,
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
