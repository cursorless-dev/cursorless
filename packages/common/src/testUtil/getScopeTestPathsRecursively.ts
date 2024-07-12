import { readFileSync } from "node:fs";
import { groupBy } from "lodash-es";
import {
  getScopeTestConfigPaths,
  getScopeTestPaths,
  type ScopeTestPath,
} from "./getFixturePaths";

export interface ScopeTestConfig {
  imports?: string[];
  skip?: boolean;
}

export function getScopeTestPathsRecursively(): ScopeTestPath[] {
  const configPaths = getScopeTestConfigPaths();
  const configs = readConfigFiles(configPaths);
  const testPathsRaw = getScopeTestPaths();
  const languagesRaw = groupBy(testPathsRaw, (test) => test.languageId);
  const result: ScopeTestPath[] = [];

  // Languages without any tests still needs to be included in case they have an import
  for (const languageId of Object.keys(configs)) {
    if (!languagesRaw[languageId]) {
      languagesRaw[languageId] = [];
    }
  }

  for (const languageId of Object.keys(languagesRaw)) {
    const config = configs[languageId];

    // This 'language' only exists to be imported by other
    if (config?.skip) {
      continue;
    }

    const testPathsForLanguage: ScopeTestPath[] = [];
    addTestPathsForLanguageRecursively(
      languagesRaw,
      configs,
      testPathsForLanguage,
      new Set(),
      languageId,
    );
    for (const test of testPathsForLanguage) {
      const name =
        languageId === test.languageId
          ? test.name
          : `${test.name.replace(`/${test.languageId}/`, `/${languageId}/`)} (${test.languageId})`;
      result.push({
        ...test,
        languageId,
        name,
      });
    }
  }

  return result;
}

function addTestPathsForLanguageRecursively(
  languages: Record<string, ScopeTestPath[]>,
  configs: Record<string, ScopeTestConfig | undefined>,
  result: ScopeTestPath[],
  usedLanguageIds: Set<string>,
  languageId: string,
): void {
  if (usedLanguageIds.has(languageId)) {
    return;
  }

  if (!languages[languageId]) {
    throw Error(`No test paths found for language ${languageId}`);
  }

  result.push(...languages[languageId]);
  usedLanguageIds.add(languageId);

  const config = configs[languageId];
  const importLanguageIds = config?.imports ?? [];

  for (const langImport of importLanguageIds) {
    addTestPathsForLanguageRecursively(
      languages,
      configs,
      result,
      usedLanguageIds,
      langImport,
    );
  }
}

function readConfigFiles(
  configPaths: { languageId: string; path: string }[],
): Record<string, ScopeTestConfig> {
  const result: Record<string, ScopeTestConfig> = {};
  for (const p of configPaths) {
    const content = readFileSync(p.path, "utf8");
    result[p.languageId] = JSON.parse(content) as ScopeTestConfig;
  }
  return result;
}
