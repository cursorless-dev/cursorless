import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { Document, ParsedNode } from "yaml";
import { Context } from "./Context";
import { getPackageDeps } from "./getPackageDeps";

interface PreCommitConfig {
  repos: {
    hooks: {
      id: string;
      // eslint-disable-next-line @typescript-eslint/naming-convention
      additional_dependencies: string[];
    }[];
  }[];
}

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
export async function updatePreCommit(
  { workspaceDir, pnpmLockfile }: Context,
  rawInput: Document<ParsedNode> | null,
  options: FormatPluginFnOptions,
): Promise<Document<ParsedNode> | null> {
  if (rawInput == null) {
    return null;
  }
  /** Directory of the package whose tsconfig.json we are updating */
  const packageDir = options.dir;

  if (packageDir !== workspaceDir) {
    throw new Error("updatePreCommit should only be called on root");
  }

  const deps = getPackageDeps(workspaceDir, packageDir, pnpmLockfile);
  const prettierVersion = deps["prettier"];

  const prettierHookIndex = (rawInput.toJS() as PreCommitConfig).repos
    .flatMap(({ hooks }, repoIndex) =>
      hooks.map((hook, hookIndex) => ({ hook, repoIndex, hookIndex })),
    )
    .filter(({ hook }) => hook.id === "prettier");

  if (prettierHookIndex.length === 0) {
    throw new Error("No prettier hook found");
  }

  if (prettierHookIndex.length > 1) {
    throw new Error("Multiple prettier hooks found");
  }

  const { repoIndex, hookIndex } = prettierHookIndex[0];

  rawInput.setIn(
    ["repos", repoIndex, "hooks", hookIndex, "additional_dependencies"],
    rawInput.createNode([`prettier@${prettierVersion}`]),
  );

  return rawInput;
}
