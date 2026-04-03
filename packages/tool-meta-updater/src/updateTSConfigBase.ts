import * as fs from "node:fs/promises";
import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import type { PackageJson, TsConfigJson } from "type-fest";
import type { Context } from "./Context";

export async function updateTSConfigBase(
  { workspaceDir, pnpmLockfile }: Context,
  rawInput: object | null,
  options: FormatPluginFnOptions,
): Promise<TsConfigJson | undefined> {
  /** Directory of the package whose tsconfig.json we are updating */
  const packageDir = options.dir;

  if (packageDir !== workspaceDir) {
    return undefined;
  }

  /** The input tsconfig.json that should be checked / updated */
  const input: TsConfigJson = (rawInput ?? {}) as TsConfigJson;

  const packages = Object.keys(pnpmLockfile.importers).filter(
    (importer) => importer !== ".",
  );

  const paths: Record<string, string[]> = {};

  for (const packagePath of packages) {
    const packageName = packagePath.replace("packages/", "@cursorless/");
    const packageJsonPath = `${packageDir}/${packagePath}/package.json`;
    const packageJson = JSON.parse(
      await fs.readFile(packageJsonPath, "utf8"),
    ) as PackageJson;

    if (!packageJson.private) {
      paths[packageName] = [`./${packagePath}`];
    }
  }

  return {
    ...rawInput,
    compilerOptions: {
      ...input.compilerOptions,
      paths,
    },
  };
}
