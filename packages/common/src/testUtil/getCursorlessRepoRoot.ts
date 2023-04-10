import * as path from "path";

/**
 * Gets the path to the root of the cursorless repo; used for scripts and tests,
 * not for production code
 * @returns The path to the root of the cursorless repo
 */
export function getCursorlessRepoRoot() {
  return (
    process.env["CURSORLESS_REPO_ROOT"] ?? path.join(__dirname, "..", "..", "..", "..")
  );
}
