import { Lockfile } from "@pnpm/lockfile-file";

/** Contains context to be used by all updaters */
export interface Context {
  /**
   * Contains the contents of the pnpm lock file
   */
  pnpmLockfile: Lockfile;

  /**
   * The path to the root of the monorepo
   */
  workspaceDir: string;
}
