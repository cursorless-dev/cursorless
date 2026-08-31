import fs from "node:fs";
import path from "node:path";
import type {
  LanguageId,
  PlaintextScopeSupportFacet,
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
  ScopeTypeType,
} from "@cursorless/lib-common";
import {
  camelCaseToAllDown,
  capitalize,
  getLanguageId,
  plaintextScopeSupportFacetInfos,
  prettifyScopeType,
  scopeReferences,
  scopeSupportFacetInfos,
  serializeScopeType,
} from "@cursorless/lib-common";

type FacetValue = ScopeSupportFacet | PlaintextScopeSupportFacet;

interface ScopeTestConfig {
  imports?: string[];
}

interface FixtureMetadata {
  facet: FacetValue;
  languageId: string;
  name: string;
  scopeTypeType: ScopeTypeType;
}

export interface ScopeFixture {
  languageId: LanguageId;
  name: string;
}

export interface ScopeFixtureFacet {
  description: string;
  facet: FacetValue;
  fixtures: ScopeFixture[];
  isIteration: boolean;
  name: string;
}

export interface ScopeFixtureGroup {
  facets: ScopeFixtureFacet[];
  name: string;
  private: boolean;
  scopeTypeType: ScopeTypeType;
}

export interface ScopeFixtureGroups {
  forLanguage(languageId: string): ScopeFixtureGroup[];
  forScope(scopeTypeType: ScopeTypeType): ScopeFixtureGroup[];
}

export function createScopeFixtureGroups(
  workspaceDir: string,
): ScopeFixtureGroups {
  const scopeFixturesDir = path.join(
    workspaceDir,
    "resources",
    "fixtures",
    "scopes",
  );
  const fixturesDir = path.dirname(scopeFixturesDir);
  const files = walkFiles(scopeFixturesDir);
  const configs = readConfigs(files, scopeFixturesDir);
  const fixtures = files
    .filter((file) => file.endsWith(".scope"))
    .map((file) => getFixtureMetadata(file, fixturesDir, scopeFixturesDir));

  return {
    forLanguage(languageId) {
      const languageIds = getImportedLanguageIds(languageId, configs);
      return groupFixtures(
        fixtures.filter(
          (fixture) =>
            languageIds.has(fixture.languageId) &&
            !fixture.scopeTypeType.startsWith("private."),
        ),
      );
    },
    forScope(scopeTypeType) {
      return groupFixtures(
        fixtures.filter((fixture) => fixture.scopeTypeType === scopeTypeType),
      );
    },
  };
}

function walkFiles(directory: string): string[] {
  const result: string[] = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkFiles(entryPath));
    } else {
      result.push(entryPath);
    }
  }

  return result;
}

function readConfigs(
  files: string[],
  scopeFixturesDir: string,
): Record<string, ScopeTestConfig> {
  const result: Record<string, ScopeTestConfig> = {};

  for (const file of files.filter((file) => file.endsWith("index.json"))) {
    const languageId = path
      .relative(scopeFixturesDir, path.dirname(file))
      .split(path.sep)[0];
    result[languageId] = JSON.parse(
      fs.readFileSync(file, "utf8"),
    ) as ScopeTestConfig;
  }

  return result;
}

function getFixtureMetadata(
  file: string,
  fixturesDir: string,
  scopeFixturesDir: string,
): FixtureMetadata {
  const relativePath = path.relative(scopeFixturesDir, file);
  const languageId = relativePath.split(path.sep)[0];
  const facetMatch = path.basename(file).match(/([a-zA-Z.]+)\d*\.scope/u);
  if (facetMatch == null) {
    throw new Error(`Unable to determine scope facet from ${file}`);
  }

  const facet = facetMatch[1] as FacetValue;
  const info = getFacetInfo(languageId, facet);

  return {
    facet,
    languageId,
    name: path
      .relative(fixturesDir, file.slice(0, -path.extname(file).length))
      .replaceAll("\\", "/"),
    scopeTypeType: serializeScopeType(info.scopeType),
  };
}

function getImportedLanguageIds(
  languageId: string,
  configs: Record<string, ScopeTestConfig>,
): Set<string> {
  const result = new Set<string>();

  function add(currentLanguageId: string) {
    if (result.has(currentLanguageId)) {
      return;
    }
    result.add(currentLanguageId);
    for (const importedLanguageId of configs[currentLanguageId]?.imports ??
      []) {
      add(importedLanguageId);
    }
  }

  add(languageId);
  return result;
}

function groupFixtures(fixtures: FixtureMetadata[]): ScopeFixtureGroup[] {
  const scopeMap = new Map<ScopeTypeType, ScopeFixtureGroup>();

  for (const fixture of fixtures) {
    let scope = scopeMap.get(fixture.scopeTypeType);
    if (scope == null) {
      const reference = scopeReferences[fixture.scopeTypeType];
      if (reference == null) {
        throw new Error(
          `Missing scope reference for: ${fixture.scopeTypeType}`,
        );
      }
      scope = {
        facets: [],
        name: prettifyScopeType(
          getFacetInfo(fixture.languageId, fixture.facet).scopeType,
        ),
        private:
          "visibility" in reference && reference.visibility === "private",
        scopeTypeType: fixture.scopeTypeType,
      };
      scopeMap.set(fixture.scopeTypeType, scope);
    }

    let facet = scope.facets.find((item) => item.facet === fixture.facet);
    if (facet == null) {
      const info = getFacetInfo(fixture.languageId, fixture.facet);
      facet = {
        description: info.description,
        facet: fixture.facet,
        fixtures: [],
        isIteration: info.isIteration ?? false,
        name: prettifyFacet(fixture.facet),
      };
      scope.facets.push(facet);
    }

    facet.fixtures.push({
      languageId: normalizeLanguageId(fixture.languageId),
      name: fixture.name,
    });
  }

  const scopes = [...scopeMap.values()].toSorted(nameComparator);
  for (const scope of scopes) {
    scope.facets.sort(facetComparator);
    for (const facet of scope.facets) {
      facet.fixtures.sort(nameComparator);
    }
  }
  return scopes;
}

function getFacetInfo(
  languageId: string,
  facet: FacetValue,
): ScopeSupportFacetInfo {
  const info =
    languageId === "plaintext"
      ? plaintextScopeSupportFacetInfos[facet as PlaintextScopeSupportFacet]
      : scopeSupportFacetInfos[facet as ScopeSupportFacet];
  if (info == null) {
    throw new Error(`Missing scope support facet info for: ${facet}`);
  }
  return info;
}

function prettifyFacet(facet: FacetValue): string {
  const parts = facet.split(".").map(camelCaseToAllDown);
  if (parts.length === 1) {
    return capitalize(parts[0]);
  }

  const iterationIndex = parts.indexOf("iteration");
  parts[0] = capitalize(parts[0]);
  if (iterationIndex === -1 || iterationIndex > 1) {
    parts[0] += ":";
    parts[1] = capitalize(parts[1]);
  }
  if (iterationIndex > 0) {
    const iteration = parts.slice(iterationIndex).join(" ");
    parts.length = iterationIndex;
    parts.push(`(${iteration})`);
  }
  return parts.join(" ");
}

function facetComparator(a: ScopeFixtureFacet, b: ScopeFixtureFacet): number {
  if (a.isIteration && !b.isIteration) {
    return 1;
  }
  if (!a.isIteration && b.isIteration) {
    return -1;
  }
  return nameComparator(a, b);
}

function nameComparator(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, undefined, { numeric: true });
}

function normalizeLanguageId(languageId: string): LanguageId {
  switch (languageId) {
    case "javascript.core":
      return "javascript";
    case "typescript.core":
      return "typescript";
    case "javascript.jsx":
      return "javascriptreact";
    default:
      return getLanguageId(languageId);
  }
}
