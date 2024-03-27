import { getRecordedTestPaths } from "@cursorless/common";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import { FixtureTransformation } from "./types";
import { upgradeDecorations } from "./upgradeDecorations";
import { checkMarks } from "./checkMarks";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  format: identity,
  ["check-marks"]: checkMarks,
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

  const testPaths =
    paths.length > 0 ? paths : getRecordedTestPaths().map(({ path }) => path);

  let failureCount = 0;

  for (const path of testPaths) {
    try {
      await transformFile(transformation, path);
    } catch (err) {
      failureCount++;
      console.warn(`Error with file ${path}`);
      console.warn((err as Error).message);
    }
  }

  if (failureCount > 0) {
    throw Error(`${failureCount} failed files`);
  }
}

main(process.argv.slice(2));
