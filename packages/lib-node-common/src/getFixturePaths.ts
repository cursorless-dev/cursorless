import path from "node:path";
import type {
  PlaintextScopeSupportFacet,
  ScopeSupportFacet,
} from "@cursorless/lib-common";
import { getCursorlessRepoRoot } from "./getCursorlessRepoRoot";
import { walkFilesSync } from "./walkSync";

export interface RecordedTestPath {
  path: string;
  name: string;
}

export interface ScopeTestPath {
  path: string;
  name: string;
  languageId: string;
  facet: ScopeSupportFacet | PlaintextScopeSupportFacet;
}

export function getFixturesPath() {
  return path.join(getCursorlessRepoRoot(), "resources", "fixtures");
}

export function getPackagePath(name: string) {
  return path.join(getCursorlessRepoRoot(), "packages", name);
}

export function getFixturePath(fixturePath: string) {
  return path.join(getFixturesPath(), fixturePath);
}

export function getRecordedTestsDirPath() {
  return path.join(getFixturesPath(), "recorded");
}

export function getRecordedDocsDirPath() {
  return path.join(getFixturesPath(), "recorded", "docs");
}

export function getRecordedTutorialDirPath() {
  return path.join(getFixturesPath(), "recorded", "tutorial");
}
export function getScopeTestsDirPath() {
  return path.join(getFixturesPath(), "scopes");
}

export function getRecordedTestPaths(): RecordedTestPath[] {
  const directory = getRecordedTestsDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".yml") || p.endsWith(".yaml"))
    .map((p) => ({
      path: p,
      name: pathToName(relativeDir, p),
    }));
}

export function getRecordedDocsPaths(): RecordedTestPath[] {
  const directory = getRecordedDocsDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".yml") || p.endsWith(".yaml"))
    .map((p) => ({
      path: p,
      name: pathToName(relativeDir, p),
    }));
}

export function getRecordedTutorialPaths(): RecordedTestPath[] {
  const directory = getRecordedTutorialDirPath();
  const relativeDir = path.dirname(directory);

  return walkFilesSync(directory)
    .filter((p) => p.endsWith(".yml") || p.endsWith(".yaml"))
    .map((p) => ({
      path: p,
      name: pathToName(relativeDir, p),
    }));
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
      facet: path.basename(p).match(/([a-zA-Z.]+)\d*\.scope/u)![1] as
        | ScopeSupportFacet
        | PlaintextScopeSupportFacet,
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
    .relative(relativeDir, filePath.slice(0, filePath.lastIndexOf(".")))
    .replaceAll("\\", "/");
}
