import * as yaml from "js-yaml";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { PackageJson } from "type-fest";
import { Context } from "./Context";
import { getCursorlessVscodeFields } from "./getCursorlessVscodeFields";
import { readFile } from "fs/promises";
import { join } from "path";
import { omitByDeep } from "@cursorless/common";
import { isUndefined } from "lodash";

/**
 * These are the entrypoints. All other packages are designed to be imported;
 * these are designed to be run.
 */
const APPS = [
  "@cursorless/cheatsheet-local",
  "@cursorless/cursorless-org-docs",
  "@cursorless/cursorless-org",
  "@cursorless/cursorless-vscode-e2e",
  "@cursorless/cursorless-vscode",
  "@cursorless/test-harness",
];

/**
 * Given a package.json, update it to match our conventions.  This function is
 * called by the pnpm `meta-updater` plugin either to check if the package.json
 * is up to date or to update it, depending on flags.
 * @param context Contains context such as workspace dir and parsed pnpm lockfile
 * @param rawInput The input package.json that should be checked / updated
 * @param options Extra information provided by pnpm; mostly just the directory
 * of the package whose package.json we are updating
 * @returns The updated package.json
 */
export async function updatePackageJson(
  { workspaceDir }: Context,
  rawInput: object | null,
  options: FormatPluginFnOptions,
): Promise<PackageJson> {
  /** The input package.json that should be checked / updated */
  const input: PackageJson = (rawInput ?? {}) as PackageJson;
  /** Directory of the package whose package.json we are updating */
  const packageDir = options.dir;

  /** Whether we are updating the top-level package.json */
  const isRoot = packageDir === workspaceDir;

  if (input.description == null || input.description === "") {
    throw new Error(`No description found in ${packageDir}/package.json`);
  }

  const name =
    isRoot || input.name?.startsWith("@cursorless/")
      ? input.name
      : `@cursorless/${input.name}`;

  const isLib = !(isRoot || APPS.includes(input.name ?? ""));

  const exportFields: Partial<PackageJson> = !isLib
    ? {}
    : {
        main: "./out/index.js",
        types: "./out/index.d.ts",
        exports: {
          ["."]: {
            // We add a custom condition called `cursorless:bundler` for use with esbuild to
            // ensure that it uses source .ts files when importing from another
            // package in our monorepo.  We use this both for esbuild and for tsx.
            // See
            // https://github.com/evanw/esbuild/issues/1250#issuecomment-1463826174
            // and
            // https://github.com/esbuild-kit/tsx/issues/96#issuecomment-1463825643
            ["cursorless:bundler"]: "./src/index.ts",
            default: "./out/index.js",
          },
        },
      };

  const isCursorlessVscode = input.name === "@cursorless/cursorless-vscode";

  const extraFields = isCursorlessVscode
    ? getCursorlessVscodeFields(input)
    : {};

  const output = {
    ...input,
    name,
    license: "MIT",
    type: name === "@cursorless/cursorless-org-docs" ? undefined : "module",
    scripts: await getScripts(input.scripts, name, packageDir, isRoot, isLib),
    devDependencies: {
      ...(input.devDependencies ?? {}),
      esbuild: input.devDependencies?.esbuild ?? (isLib ? "0" : undefined),
    },
    ...exportFields,
    ...extraFields,
  };

  return omitByDeep(output, isUndefined) as PackageJson;
}

interface PreCommitConfig {
  repos: {
    hooks: {
      id: string;
      name: string;
      entry: string;
    }[];
  }[];
}

async function getScripts(
  inputScripts: PackageJson.Scripts | undefined,
  name: string | undefined,
  packageDir: string,
  isRoot: boolean,
  isLib: boolean,
) {
  let compile: string | undefined;
  if (isLib) {
    compile =
      "esbuild ./src/index.ts --sourcemap --format=esm --bundle --packages=external --outfile=./out/index.js";
  } else if (isRoot) {
    compile = "tsc --build && pnpm -r compile";
  }
  const scripts: PackageJson.Scripts = {
    ...(inputScripts ?? {}),
    compile,
    watch: "tsc --build --watch",
    ...(isLib
      ? {
          ["watch:esbuild"]: "pnpm compile --watch",
        }
      : {}),
  };

  if (isRoot) {
    // Ensure that `pnpm transform-recorded-tests` mirrors what is in pre-commit
    // config
    scripts["transform-recorded-tests"] =
      await getTransformRecordedTestsScript(packageDir);

    return scripts;
  }

  const cleanDirs = ["./out", "tsconfig.tsbuildinfo", "./dist", "./build"];

  const clean = `rm -rf ${cleanDirs.join(" ")}`;

  const cleanScripts =
    name === "@cursorless/cursorless-org-docs"
      ? ["pnpm clear", clean]
      : [clean];

  scripts.clean = cleanScripts.join(" && ");

  return scripts;
}

async function getTransformRecordedTestsScript(packageDir: string) {
  const preCommitConfig = yaml.load(
    await readFile(join(packageDir, ".pre-commit-config.yaml"), "utf8"),
  ) as PreCommitConfig;

  const formatRecordedTestsEntry = preCommitConfig.repos
    .flatMap(({ hooks }) => hooks)
    .find(({ id }) => id === "format-recorded-tests")?.entry;

  if (!formatRecordedTestsEntry?.startsWith("pnpm exec ")) {
    throw new Error(
      'Expected pre-commit transform-recorded-tests entry to start with "pnpm exec "',
    );
  }

  const checkRecordedTestMarksEntry = preCommitConfig.repos
    .flatMap(({ hooks }) => hooks)
    .find(({ id }) => id === "check-recorded-test-marks")?.entry;

  if (!checkRecordedTestMarksEntry?.startsWith(formatRecordedTestsEntry)) {
    throw new Error(
      "Expected pre-commit check-recorded-test-marks entry to mirror format-recorded-test-marks",
    );
  }

  const transformRecordedTestsScript =
    "env CURSORLESS_REPO_ROOT=. " +
    formatRecordedTestsEntry.slice("pnpm exec ".length);

  return transformRecordedTestsScript;
}
