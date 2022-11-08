import { getRecordedTestPaths } from "../../apps/cursorless-vscode-e2e/getFixturePaths";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import { FixtureTransformation } from "./types";
import { upgradeThatMarks } from "./upgradeThatMarks";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  autoFormat: identity,
  custom: upgradeThatMarks,
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
