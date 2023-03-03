import * as path from "path";
import { walkFilesSync } from "../util/walkSync";
import { getCursorlessRepoRoot } from "./getCursorlessRepoRoot";

export function getFixturesPath() {
  return path.join(
    getCursorlessRepoRoot(),
    "packages",
    "cursorless-vscode-e2e",
    "suite",
    "fixtures",
  );
}

export function getFixturePath(fixturePath: string) {
  return path.join(getFixturesPath(), fixturePath);
}

export function getRecordedTestPaths() {
  const directory = path.join(getFixturesPath(), "recorded");

  return walkFilesSync(directory).filter(
    (path) => path.endsWith(".yml") || path.endsWith(".yaml"),
  );
}
