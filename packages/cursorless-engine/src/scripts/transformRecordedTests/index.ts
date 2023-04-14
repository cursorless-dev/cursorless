import { getRecordedTestPaths } from "@cursorless/common";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import { FixtureTransformation } from "./types";
import { upgradeDecorations } from "./upgradeDecorations";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  format: identity,
  custom: upgradeDecorations,
};

async function main(args: string[]) {
  const [transformationName, paths] = args?.[0]?.startsWith("--")
    ? [args[0].slice(2), args.slice(1)]
    : [null, args];

  const transformation =
    transformationName == null
      ? identity
      : AVAILABLE_TRANSFORMATIONS[transformationName];

  if (transformation == null) {
    throw new Error(`Unknown transformation ${transformationName}`);
  }

  const testPaths = paths.length > 0 ? paths : getRecordedTestPaths();

  testPaths.forEach((path) => transformFile(transformation, path));
}

main(process.argv.slice(2));
