// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE
import { Lockfile, readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions, FormatPluginFnOptions } from "@pnpm/meta-updater";
import normalizePath from "normalize-path";
import path from "path";
import exists from "path-exists";
import { PackageJson, TsConfigJson } from "type-fest";

export const updater = async (workspaceDir: string) => {
  const lockfile = await readWantedLockfile(workspaceDir, {
    ignoreIncompatible: false,
  });
  if (lockfile == null) {
    throw new Error("no lockfile found");
  }
  return createUpdateOptions({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "package.json": updatePackageJson.bind(null, { workspaceDir }),
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "tsconfig.json": updateTSConfig.bind(null, {
      lockfile,
      workspaceDir,
    }),
  });
};

async function updateTSConfig(
  context: {
    lockfile: Lockfile;
    workspaceDir: string;
  },
  config: object | null,
  { dir }: FormatPluginFnOptions,
): Promise<TsConfigJson> {
  const tsConfig: TsConfigJson = (config ?? {}) as TsConfigJson;

  if (dir === context.workspaceDir) {
    // Root tsconfig includes no files, but references all packages to make find
    // references work by loading all packages
    return {
      files: [],
      include: [],
      references: Object.keys(context.lockfile.importers)
        .filter((importer) => importer !== ".")
        .map((importer) => ({
          path: `./${importer}`,
        })),
    };
  }
  const relative = normalizePath(path.relative(context.workspaceDir, dir));
  const pathToRoot = normalizePath(path.relative(dir, context.workspaceDir));
  const importer = context.lockfile.importers[relative];
  if (!importer) {
    // Raise an error here because there should always be an entry in the lockfile.
    throw new Error(`No importer found for ${relative}`);
  }
  const deps = {
    ...importer.dependencies,
    ...importer.devDependencies,
  };
  const references = [] as Array<{ path: string }>;
  for (const spec of Object.values(deps)) {
    if (!spec.startsWith("link:") || spec.length === 5) {
      continue;
    }
    const relativePath = spec.slice(5);
    if (!(await exists(path.join(dir, relativePath, "tsconfig.json")))) {
      throw new Error(`No tsconfig found for ${relativePath} in ${dir}`);
    }
    references.push({ path: relativePath });
  }

  return {
    ...tsConfig,
    extends: path.join(pathToRoot, "tsconfig.base.json"),
    compilerOptions: {
      ...(tsConfig.compilerOptions ?? {}),
      rootDir: "src",
      outDir: "out",
    },
    references: references.sort((r1, r2) => r1.path.localeCompare(r2.path)),
    include: [
      "src/**/*.ts",
      "src/**/*.json",

      ...(tsConfig.compilerOptions?.jsx == null ? [] : ["src/**/*.tsx"]),

      ...((await exists(path.join(dir, "next.config.js")))
        ? ["next-env.d.ts"]
        : []),

      path.join(pathToRoot, "typings", "**/*.d.ts"),
    ],
  };
}

async function updatePackageJson(
  context: {
    workspaceDir: string;
  },
  config: object | null,
  { dir }: FormatPluginFnOptions,
): Promise<PackageJson> {
  const packageJson: PackageJson = (config ?? {}) as PackageJson;

  if (dir === context.workspaceDir) {
    // Don't touch root-level config
    return packageJson;
  }

  if (packageJson.description == null || packageJson.description === "") {
    throw new Error(`No description found in ${dir}/package.json`);
  }

  if (packageJson.name === "@cursorless/cursorless-vscode") {
    return packageJson;
  }

  const name = packageJson.name?.startsWith("@cursorless/")
    ? packageJson.name
    : `@cursorless/${packageJson.name}`;

  return {
    ...packageJson,
    name,
    license: "MIT",
    main: "./out/index.js",
    types: "./out/index.d.ts",
    scripts: {
      ...(packageJson.scripts ?? {}),
      compile: "tsc --build",
      watch: "tsc --build --watch",
    },
    exports: "./out/index.js",
  } as PackageJson;
}
