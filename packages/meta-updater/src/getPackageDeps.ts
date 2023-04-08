import normalizePath from "normalize-path";
import path from "path";
import { Lockfile } from "@pnpm/lockfile-file";

/**
 * Get the dependencies of the given package from the pnpm lockfile.
 * @param workspaceDir The root of the workspace
 * @param packageDir The directory of the package whose dependencies we are
 * retrieving
 * @param pnpmLockfile The parsed pnpm lockfile
 * @returns A map of package names to package specs for the dependencies of the
 * given package
 */
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
