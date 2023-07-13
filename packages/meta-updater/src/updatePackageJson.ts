import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { PackageJson } from "type-fest";
import { Context } from "./Context";
import { getCursorlessVscodeFields } from "./getCursorlessVscodeFields";

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

  const exportFields: Partial<PackageJson> =
    isRoot || input.name === "@cursorless/cursorless-vscode"
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

  const extraFields =
    input.name === "@cursorless/cursorless-vscode"
      ? getCursorlessVscodeFields(input)
      : {};

  const extraScripts = isRoot
    ? {}
    : {
        clean: "rm -rf ./out tsconfig.tsbuildinfo",
      };

  return {
    ...input,
    name,
    license: "MIT",
    scripts: {
      ...(input.scripts ?? {}),
      compile: "tsc --build",
      watch: "tsc --build --watch",
      ...extraScripts,
    },
    ...exportFields,
    ...extraFields,
  } as PackageJson;
}
