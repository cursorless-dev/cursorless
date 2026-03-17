import { omitByDeep } from "@cursorless/common";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { isUndefined } from "lodash-es";
import type { PackageJson } from "type-fest";
import type { Context } from "./Context";
import { getCursorlessVscodeFields } from "./getCursorlessVscodeFields";

const LIB_ENTRY_POINT = "./src/index.ts";

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

  const isLib = !isRoot && !input.private;

  const exportFields: Partial<PackageJson> = (() => {
    if (!isLib) {
      return {};
    }
    const exports =
      input.exports != null &&
      typeof input.exports === "object" &&
      !Array.isArray(input.exports)
        ? input.exports
        : {};
    exports["."] = LIB_ENTRY_POINT;
    return { exports };
  })();

  const isCursorlessVscode = input.name === "@cursorless/cursorless-vscode";

  const extraFields = isCursorlessVscode
    ? getCursorlessVscodeFields(input)
    : {};

  const output = {
    ...input,
    name,
    license: "MIT",
    type:
      name === "@cursorless/cursorless-org-docs" ||
      name === "@cursorless/cursorless-neovim"
        ? undefined
        : "module",
    scripts: await getScripts(input.scripts, name, packageDir, isRoot, isLib),
    ...exportFields,
    ...extraFields,
  };

  removeEmptyFields(output);

  return omitByDeep(sortFields(output), isUndefined) as PackageJson;
}

async function getScripts(
  inputScripts: PackageJson.Scripts | undefined,
  name: string | undefined,
  packageDir: string,
  isRoot: boolean,
  _isLib: boolean,
) {
  const scripts: PackageJson.Scripts = {
    ...(inputScripts ?? {}),
  };

  if (isRoot) {
    return scripts;
  }

  scripts.typecheck = "tsc";

  const cleanDirs = ["./out", "tsconfig.tsbuildinfo", "./dist", "./build"];
  const clean = `rm -rf ${cleanDirs.join(" ")}`;
  const cleanScripts =
    name === "@cursorless/cursorless-org-docs"
      ? ["docusaurus clear", clean]
      : [clean];

  scripts.clean = cleanScripts.join(" && ");

  const orderedKeys = [
    "typecheck",
    "clean",
    "test",
    "pretest",
    "dev",
    "build",
    "bundle",
  ];
  const getOrder = (key: string) => {
    const index = orderedKeys.findIndex((k) => key.startsWith(k));
    return index === -1 ? Number.POSITIVE_INFINITY : index;
  };

  return Object.fromEntries(
    Object.entries(scripts).sort(
      ([keyA], [keyB]) => getOrder(keyA) - getOrder(keyB),
    ),
  );
}

function removeEmptyFields(obj: Record<string, any>) {
  for (const keyword in obj) {
    const value = obj[keyword];
    if (Array.isArray(value) && value.length === 0) {
      delete obj[keyword];
    }
    if (typeof value === "string" && value.length === 0) {
      delete obj[keyword];
    }
  }
}

function sortFields(obj: Record<string, any>): Record<string, any> {
  const orderedKeys = [
    "name",
    "displayName",
    "version",
    "description",
    "license",
    "author",
    "publisher",
    "homepage",
    "repository",
    "funding",
    "sponsor",
    "private",
    "packageManager",
    "type",
    "main",
    "types",
    "bin",
    "exports",
    "engines",
    "extensionKind",
    "categories",
    "keywords",
    "activationEvents",
    "sideEffects",
    "icon",
    "galleryBanner",
    "badges",
    "capabilities",
    "contributes",
    "postcss",
    "browserslist",
    "scripts",
    "extensionDependencies",
    "dependencies",
    "devDependencies",
    "pnpm",
  ];
  const sorted = Object.fromEntries(
    Object.entries(obj).sort(
      ([keyA], [keyB]) => orderedKeys.indexOf(keyA) - orderedKeys.indexOf(keyB),
    ),
  );

  if (sorted.dependencies != null) {
    sorted.dependencies = Object.fromEntries(
      Object.entries(sorted.dependencies).sort(),
    );
  }
  if (sorted.devDependencies != null) {
    sorted.devDependencies = Object.fromEntries(
      Object.entries(sorted.devDependencies).sort(),
    );
  }

  return sorted;
}
