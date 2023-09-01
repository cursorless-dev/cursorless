import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import normalizePath from "normalize-path";
import path from "path";
import exists from "path-exists";
import type { TsConfigJson } from "type-fest";
import { toPosixPath } from "./toPosixPath";
import type { Context } from "./Context";
import { uniq } from "lodash";

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

  const pathFromRootToPackage = normalizePath(
    path.relative(workspaceDir, packageDir),
  );
  const pathFromPackageToRoot = normalizePath(
    path.relative(packageDir, workspaceDir),
  );

  /** Info about package dependencies gleaned from lock file. */
  const lockFilePackageInfo = pnpmLockfile.importers[pathFromRootToPackage];
  if (!lockFilePackageInfo) {
    // Raise an error here because there should always be an entry in the lockfile.
    throw new Error(`No importer found for ${pathFromRootToPackage}`);
  }

  const deps = {
    ...lockFilePackageInfo.dependencies,
    ...lockFilePackageInfo.devDependencies,
  };

  /** Computed tsconfig.json references based on dependencies. */
  const references = [] as Array<{ path: string }>;
  for (const spec of Object.values(deps)) {
    if (!spec.startsWith("link:") || spec.length === 5) {
      // Only consider references to other packages in monorepo.
      continue;
    }
    const relativePath = spec.slice(5);
    if (!(await exists(path.join(packageDir, relativePath, "tsconfig.json")))) {
      throw new Error(`No tsconfig found for ${relativePath} in ${packageDir}`);
    }
    references.push({ path: relativePath });
  }

  return {
    ...input,
    extends: getExtends(pathFromPackageToRoot, input.extends),
    compilerOptions: {
      ...(input.compilerOptions ?? {}),
      rootDir: "src",
      outDir: "out",
    },
    references: references.sort((r1, r2) => r1.path.localeCompare(r2.path)),
    include: [
      "src/**/*.ts",
      "src/**/*.json",

      ...(input.compilerOptions?.jsx == null ? [] : ["src/**/*.tsx"]),

      ...((await exists(path.join(packageDir, "next.config.js")))
        ? ["next-env.d.ts"]
        : []),

      toPosixPath(path.join(pathFromPackageToRoot, "typings", "**/*.d.ts")),
    ],
  };
}

function getExtends(
  pathFromPackageToRoot: string,
  inputExtends: string | string[] | undefined,
) {
  let extendsList =
    inputExtends == null
      ? []
      : Array.isArray(inputExtends)
      ? [...inputExtends]
      : [inputExtends];

  extendsList.push(
    toPosixPath(path.join(pathFromPackageToRoot, "tsconfig.base.json")),
  );

  extendsList = uniq(extendsList);

  return extendsList.length === 1 ? extendsList[0] : extendsList;
}
