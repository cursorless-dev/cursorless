import { groupBy, type ScopeTestRecorderStorage } from "@cursorless/common";

import {
  getScopeTestPathsRecursively,
  getScopeTestsDirPath,
} from "@cursorless/node-common";
import * as fs from "node:fs";
import * as fsPromises from "node:fs/promises";
import * as path from "node:path";

export class FileSystemScopeTestRecorderStorage
  implements ScopeTestRecorderStorage
{
  getTestedScopeFacets(languageId: string): Set<string> {
    const testPaths = getScopeTestPathsRecursively();
    const languages = groupBy(testPaths, (test) => test.languageId);
    const testPathsForLanguage = languages.get(languageId) ?? [];
    const facets = testPathsForLanguage.map((test) => test.facet);
    return new Set(facets);
  }

  async saveScopeFacetTest(
    languageId: string,
    facet: string,
    content: string,
  ): Promise<void> {
    const langDirectory = path.join(getScopeTestsDirPath(), languageId);
    let filePath = path.join(langDirectory, `${facet}.scope`);
    let i = 2;

    while (fs.existsSync(filePath)) {
      filePath = path.join(langDirectory, `${facet}${i++}.scope`);
    }

    await fsPromises.mkdir(langDirectory, { recursive: true });
    await fsPromises.writeFile(filePath, content, "utf-8");
  }
}
