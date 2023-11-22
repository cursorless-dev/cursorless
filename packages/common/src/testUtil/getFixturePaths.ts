import * as path from "path";
import { walkFilesSync } from "../util/walkSync";
import { getCursorlessRepoRoot } from "./getCursorlessRepoRoot";

export function getFixturesPath() {
  return path.join(
    getCursorlessRepoRoot(),
    "packages",
    "cursorless-vscode-e2e",
    "src",
    "suite",
    "fixtures",
  );
}

export function getFixturePath(fixturePath: string) {
  return path.join(getFixturesPath(), fixturePath);
}

export function getRecordedTestsDirPath() {
  return path.join(getFixturesPath(), "recorded");
}

export function getScopeTestsDirPath() {
  return path.join(getFixturesPath(), "scopes");
}

export function getRecordedTestPaths() {
  const directory = getRecordedTestsDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".yml") || p.endsWith(".yaml"))
    .map((p) => ({
      name: path.relative(relativeDir, p.substring(0, p.lastIndexOf("."))),
      path: p,
    }));
}

export function getScopeTestPaths() {
  const directory = getScopeTestsDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".scope"))
    .map((p) => ({
      path: p,
      name: path.relative(relativeDir, p.substring(0, p.lastIndexOf("."))),
      languageId: path.dirname(path.relative(directory, p)),
      facetId: path.basename(p.substring(0, p.lastIndexOf("."))),
    }));
}
