// Copied and modified from
// https://github.com/pnpm/pnpm/tree/d583fbb2ad7e6b986d133a4eaf60824713f13c06/.meta-updater/src/index.ts
// License was
// https://github.com/pnpm/pnpm/blob/d583fbb2ad7e6b986d133a4eaf60824713f13c06/LICENSE
import { Lockfile, readWantedLockfile } from "@pnpm/lockfile-file";
import { createUpdateOptions, FormatPluginFnOptions } from "@pnpm/meta-updater";
import normalizePath from "normalize-path";
import path from "path";
import exists from "path-exists";

export const updater = async (workspaceDir: string) => {
  const lockfile = await readWantedLockfile(workspaceDir, {
    ignoreIncompatible: false,
  });
  if (lockfile == null) {
    throw new Error("no lockfile found");
  }
  return createUpdateOptions({
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
  tsConfig: object | null,
  { dir }: FormatPluginFnOptions,
) {
  if (tsConfig == null) {
    return tsConfig;
  }
  const relative = normalizePath(path.relative(context.workspaceDir, dir));
  const pathToRoot = normalizePath(path.relative(dir, context.workspaceDir));
  const importer = context.lockfile.importers[relative];
  if (!importer) {
    return tsConfig;
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
      continue;
    }
    references.push({ path: relativePath });
  }

  return {
    ...tsConfig,
    extends: path.join(pathToRoot, "tsconfig.base.json"),
    compilerOptions: {
      ...(tsConfig as any)["compilerOptions"],
      rootDir: ".",
      outDir: "out",
      composite: true,
    },
    references: references.sort((r1, r2) => r1.path.localeCompare(r2.path)),
    include: ["**/*.ts"],
    exclude: ["**/node_modules/**", "out/**"],
  };
}
