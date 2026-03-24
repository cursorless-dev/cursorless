import { getLockfileImporterId } from "@pnpm/lockfile-file";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { cloneDeep, isEqual } from "lodash-es";
import normalizePath from "normalize-path";
import * as path from "path";
import type { TsConfigJson } from "type-fest";
import type { Context } from "./Context";
import { toPosixPath } from "./toPosixPath";

const baseName = "tsconfig.base.json";
const webJsonName = "tsconfig.web.json";

/**
 * Given a tsconfig.json, update it to match our conventions.  This function is
 * called by the pnpm `meta-updater` plugin either to check if the tsconfig.json
 * is up to date or to update it, depending on flags.
 * @param context Contains context such as workspace dir and parsed pnpm
 * lockfile
 * @param rawInput The input tsconfig.json that should be checked / updated
 * @param options Extra information provided by pnpm; mostly just the directory
 * of the package whose tsconfig.json we are updating
 * @returns The updated tsconfig.json
 */
export async function updateTSConfig(
  { workspaceDir, pnpmLockfile }: Context,
  rawInput: object | null,
  options: FormatPluginFnOptions,
): Promise<TsConfigJson> {
  /** The input tsconfig.json that should be checked / updated */
  const input: TsConfigJson = (rawInput ?? {}) as TsConfigJson;
  /** Directory of the package whose tsconfig.json we are updating */
  const packageDir = options.dir;

  if (packageDir === workspaceDir) {
    // Root tsconfig includes no files, but references all packages to make find
    // references work by loading all packages
    return {
      files: [],
      include: [],
      references: Object.keys(pnpmLockfile.importers)
        .filter((importer) => importer !== ".")
        .map((importer) => ({
          path: `./${importer}`,
        })),
    };
  }

  const pathFromRootToPackage = getLockfileImporterId(workspaceDir, packageDir);
  const pathFromPackageToRoot = normalizePath(
    path.relative(packageDir, workspaceDir),
  );

  /** Info about package dependencies gleaned from lock file. */
  const lockFilePackageInfo = pnpmLockfile.importers[pathFromRootToPackage];
  if (!lockFilePackageInfo) {
    // Raise an error here because there should always be an entry in the lockfile.
    throw new Error(`No importer found for ${pathFromRootToPackage}`);
  }

  const compilerOptions = {
    ...cloneDeep(input.compilerOptions),
  };
  delete compilerOptions.outDir;
  delete compilerOptions.rootDir;

  const extendsList = getExtends(pathFromPackageToRoot, input.extends);
  const isWeb =
    input.compilerOptions?.jsx != null ||
    extendsList.some((e) => e.endsWith(webJsonName));

  return {
    ...input,
    extends: extendsList.length === 1 ? extendsList[0] : extendsList,

    ...(isEqual(compilerOptions, {}) ? {} : { compilerOptions }),

    include: [
      "src/**/*.ts",
      ...(isWeb ? ["src/**/*.tsx"] : []),
      "src/**/*.json",
      toPosixPath(
        path.join(pathFromPackageToRoot, "resources", "typings", "**/*.d.ts"),
      ),
    ],
  };
}

function getExtends(
  pathFromPackageToRoot: string,
  inputExtends: string | string[] | undefined,
) {
  const extendsList =
    inputExtends == null
      ? []
      : Array.isArray(inputExtends)
        ? [...inputExtends]
        : [inputExtends];

  const basePath = toPosixPath(path.join(pathFromPackageToRoot, baseName));
  const webPath = toPosixPath(path.join(pathFromPackageToRoot, webJsonName));

  if (!extendsList.includes(basePath) && !extendsList.includes(webPath)) {
    extendsList.push(basePath);
  }

  return extendsList;
}
