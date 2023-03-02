import path = require("path");

/**
 * @returns The path to the root of the cursorless repo
 */
export function getCursorlessRepoRoot() {
  return path.join(__dirname, "..", "..", "..", "..");
}
