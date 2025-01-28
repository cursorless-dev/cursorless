import type {
  SnippetMap,
  SnippetVariable as SnippetVariableLegacy,
} from "@cursorless/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  serializeSnippetFile,
  type SnippetFile,
  type SnippetVariable,
} from "talon-snippets";
import * as vscode from "vscode";
import {
  CURSORLESS_SNIPPETS_SUFFIX,
  type VscodeSnippets,
} from "./VscodeSnippets";

export async function migrateSnippets(
  snippets: VscodeSnippets,
  targetDirectory: string,
) {
  const userSnippetsDir = snippets.getUserDirectoryStrict();
  const files = await snippets.getSnippetPaths(userSnippetsDir);

  for (const file of files) {
    await migrateFile(targetDirectory, file);
  }

  await vscode.window.showInformationMessage(
    `${files.length} snippet files migrated successfully!`,
  );
}

async function migrateFile(targetDirectory: string, filePath: string) {
  const fileName = path.basename(filePath, CURSORLESS_SNIPPETS_SUFFIX);
  const snippetFile = await readLegacyFile(filePath);
  const communitySnippetFile: SnippetFile = { snippets: [] };

  for (const snippetName in snippetFile) {
    const snippet = snippetFile[snippetName];

    communitySnippetFile.header = {
      name: snippetName,
      description: snippet.description,
      variables: parseVariables(snippet.variables),
      insertionScopes: snippet.insertionScopeTypes,
    };

    for (const def of snippet.definitions) {
      communitySnippetFile.snippets.push({
        body: def.body.map((line) => line.replaceAll("\t", "    ")),
        languages: def.scope?.langIds,
        variables: parseVariables(def.variables),
        // SKIP: def.scope?.scopeTypes
        // SKIP: def.scope?.excludeDescendantScopeTypes
      });
    }
  }

  try {
    const destinationPath = path.join(targetDirectory, `${fileName}.snippet`);
    await writeCommunityFile(communitySnippetFile, destinationPath);
  } catch (error: any) {
    if (error.code === "EEXIST") {
      const destinationPath = path.join(
        targetDirectory,
        `${fileName}_CONFLICT.snippet`,
      );
      await writeCommunityFile(communitySnippetFile, destinationPath);
    } else {
      throw error;
    }
  }
}

function parseVariables(
  variables?: Record<string, SnippetVariableLegacy>,
): SnippetVariable[] {
  return Object.entries(variables ?? {}).map(
    ([name, variable]): SnippetVariable => {
      return {
        name,
        wrapperScope: variable.wrapperScopeType,
        insertionFormatters: variable.formatter
          ? [variable.formatter]
          : undefined,
        // SKIP: variable.description
      };
    },
  );
}

async function readLegacyFile(filePath: string): Promise<SnippetMap> {
  const content = await fs.readFile(filePath, "utf8");
  if (content.length === 0) {
    return {};
  }
  return JSON.parse(content);
}

async function writeCommunityFile(snippetFile: SnippetFile, filePath: string) {
  const snippetText = serializeSnippetFile(snippetFile);
  const file = await fs.open(filePath, "wx");
  await file.write(snippetText);
  await file.close();
}
