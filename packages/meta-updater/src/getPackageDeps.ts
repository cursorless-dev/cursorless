import normalizePath from "normalize-path";
import path from "path";
import { Lockfile } from "@pnpm/lockfile-file";

export function getPackageDeps(
  workspaceDir: string,
  packageDir: string,
  pnpmLockfile: Lockfile,
) {
  const pathFromRootToPackage =
    packageDir === workspaceDir
      ? "."
      : normalizePath(path.relative(workspaceDir, packageDir));

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
  return deps;
}
