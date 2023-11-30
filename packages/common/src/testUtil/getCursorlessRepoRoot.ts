/**
 * Gets the path to the root of the cursorless repo; used for scripts and tests,
 * not for production code
 * @returns The path to the root of the cursorless repo
 */
export function getCursorlessRepoRoot() {
  const root = process.env["CURSORLESS_REPO_ROOT"];
  if (root == null) {
    throw new Error(
      "CURSORLESS_REPO_ROOT environment variable must be set to run this script",
    );
  }
  return root;
}
