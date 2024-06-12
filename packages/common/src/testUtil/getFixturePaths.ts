import * as path from "path";
import { walkFilesSync } from "../util/walkSync";
import { getCursorlessRepoRoot } from "./getCursorlessRepoRoot";

export function getFixturesPath() {
  return path.join(getCursorlessRepoRoot(), "data", "fixtures");
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
      path: p,
      name: pathToName(relativeDir, p),
    }));
}

export interface ScopeTestPath {
  path: string;
  name: string;
  languageId: string;
  facet: string;
}

export function getScopeTestPaths(): ScopeTestPath[] {
  const directory = getScopeTestsDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".scope"))
    .map((p) => ({
      path: p,
      name: pathToName(relativeDir, p),
      languageId: path.dirname(path.relative(directory, p)).split(path.sep)[0],
      facet: path.basename(p).match(/([a-zA-Z.]+)\d*\.scope/)![1],
    }));
}

export function getScopeTestConfigPaths() {
  const directory = getScopeTestsDirPath();

  return walkFilesSync(directory)
    .filter((p) => p.endsWith("index.json"))
    .map((p) => ({
      path: p,
      languageId: path.dirname(path.relative(directory, p)).split(path.sep)[0],
    }));
}

function pathToName(relativeDir: string, filePath: string) {
  return path
    .relative(relativeDir, filePath.substring(0, filePath.lastIndexOf(".")))
    .replaceAll("\\", "/");
}
