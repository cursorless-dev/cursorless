import {
  CommandVersion,
  LATEST_VERSION,
  TestCaseFixtureLegacy,
  getRecordedTestPaths,
} from "@cursorless/common";
import { identity } from "./transformations/identity";
import { upgrade } from "./transformations/upgrade";
import { transformFile } from "./transformFile";
import { FixtureTransformation } from "./types";
import { upgradeDecorations } from "./upgradeDecorations";
import { checkMarks } from "./checkMarks";
import { canonicalize } from "./transformations/canonicalize";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  canonicalize,
  format: identity,
  ["check-marks"]: checkMarks,
  custom: upgradeDecorations,
};

async function main(args: string[]) {
  const { transformationName, minimumVersion, paths } =
    parseCommandLineArguments(args);

  let transformation =
    transformationName == null
      ? identity
      : AVAILABLE_TRANSFORMATIONS[transformationName];

  if (transformation === upgrade && minimumVersion != null) {
    transformation = (originalFixture: TestCaseFixtureLegacy) =>
      upgrade(originalFixture, minimumVersion);
  }

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
      console.log(`Error with file ${path}`);
      console.log((err as Error).message);
    }
  }

  if (failureCount > 0) {
    throw Error(`${failureCount} failed files`);
  }
}

function parseCommandLineArguments(args: string[]) {
  const paths = [];
  let transformationName: string | undefined = undefined;
  let minimumVersion: CommandVersion | undefined = undefined;
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const flagName = arg.slice(2);

      if (flagName in AVAILABLE_TRANSFORMATIONS) {
        transformationName = flagName;
        continue;
      }

      if (flagName === "minimum-version") {
        const minimumVersionUnchecked = parseInt(args[i + 1]);
        if (
          minimumVersionUnchecked < 0 ||
          minimumVersionUnchecked > LATEST_VERSION
        ) {
          throw new Error(
            `Minimum version must be between 0 and ${LATEST_VERSION} inclusive`,
          );
        }
        minimumVersion = minimumVersionUnchecked as CommandVersion;
        i++;
        continue;
      }

      throw new Error(`Unknown flag ${flagName}`);
    }
    paths.push(arg);
  }

  return { transformationName, minimumVersion, paths };
}

void main(process.argv.slice(2));
