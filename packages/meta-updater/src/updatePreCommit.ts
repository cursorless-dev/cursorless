import type { FormatPluginFnOptions } from "@pnpm/meta-updater";
import { Document, ParsedNode } from "yaml";
import { Context } from "./Context";
import { Lockfile } from "@pnpm/lockfile-file";
import { pickBy } from "lodash";
import { mergeStrict } from "./mergeStrict";

/**
 * Subset of the .pre-commit-config.yaml schema that we care about.
 */
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
 * Given a .pre-commit-config.yaml, update it to ensure that the versions of our
 * hooks match the corresponding package versions in package.json.  This
 * function is called by the pnpm `meta-updater` plugin either to check if the
 * .pre-commit-config.yaml is up to date or to update it, depending on flags.
 * @param context Contains context such as workspace dir and parsed pnpm
 * lockfile
 * @param rawInput The input .pre-commit-config.yaml that should be checked /
 * updated. This is a parsed yaml document in the `yaml` library's document
 * representation; not a plain js object like you'd get from a json parser.  We
 * need it like this so that we can preserve comments.
 * @param options Extra information provided by pnpm; mostly just the directory
 * of the package whose .pre-commit-config.yaml we are updating
 * @returns The updated .pre-commit-config.yaml
 */
export async function updatePreCommit(
  { workspaceDir, pnpmLockfile }: Context,
  rawInput: Document<ParsedNode> | null,
  options: FormatPluginFnOptions,
): Promise<Document<ParsedNode> | null> {
  if (rawInput == null) {
    return null;
  }
  /** Directory of the package whose .pre-commit-config.yaml we are updating */
  const packageDir = options.dir;

  if (packageDir !== workspaceDir) {
    throw new Error("updatePreCommit should only be called on root");
  }

  updateHook(pnpmLockfile, rawInput, "prettier", (name) => name === "prettier");
  updateHook(
    pnpmLockfile,
    rawInput,
    "eslint",
    (name) => name.includes("eslint") || name === "typescript",
  );

  return rawInput;
}

/**
 * Updates the additional_dependencies of a hook in a .pre-commit-config.yaml to
 * match the versions from the lockfile.
 * @param pnpmLockfile The pnpm lockfile, which contains the versions of all
 * packages in the workspace
 * @param rawInput The input .pre-commit-config.yaml that should be checked /
 * updated
 * @param hookId The id of the hook to update
 * @param packageMatcher A function that returns true if the given package name
 * should be added to the hook's additional_dependencies
 */
function updateHook(
  pnpmLockfile: Lockfile,
  rawInput: Document<ParsedNode>,
  hookId: string,
  packageMatcher: (name: string) => boolean,
) {
  // Find all packages that match the given packageMatcher in the dependencies
  // of any package in the workspace
  const packages = Object.entries(
    mergeStrict(
      ...Object.values(pnpmLockfile.importers)
        .flatMap((packageInfo) => [
          packageInfo.dependencies ?? {},
          packageInfo.devDependencies ?? {},
        ])
        .map((deps) => pickBy(deps, (_, key) => packageMatcher(key))),
    ),
  );

  // Find the hook in the .pre-commit-config.yaml.  Easier to grab the indices
  // from the raw js representation so that we can just use `setIn` to update
  // the hook
  const desiredHooks = (rawInput.toJS() as PreCommitConfig).repos
    .flatMap(({ hooks }, repoIndex) =>
      hooks.map((hook, hookIndex) => ({ hook, repoIndex, hookIndex })),
    )
    .filter(({ hook }) => hook.id === hookId);

  if (desiredHooks.length === 0) {
    throw new Error(`No ${hookId} hook found`);
  }

  if (desiredHooks.length > 1) {
    throw new Error(`Multiple ${hookId} hooks found`);
  }

  const { repoIndex, hookIndex } = desiredHooks[0];

  rawInput.setIn(
    ["repos", repoIndex, "hooks", hookIndex, "additional_dependencies"],
    rawInput.createNode(
      packages
        .map(([name, version]) => {
          if (version.includes("(")) {
            // pnpm includes the integrity hash in the version, which we don't
            // need here
            version = version.slice(0, version.indexOf("("));
          }
          return `${name}@${version}`;
        })
        .sort(),
    ),
  );
}
