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

interface Result {
  migrated: Record<string, string>;
  migratedPartially: Record<string, string>;
  skipped: string[];
}

export interface SpokenForms {
  insertion: Record<string, string>;
  insertionWithPhrase: Record<string, string>;
  wrapper: Record<string, string>;
}

export async function migrateSnippets(
  snippets: VscodeSnippets,
  targetDirectory: string,
  spokenForms: SpokenForms,
) {
  const sourceDirectory = snippets.getUserDirectoryStrict();
  const files = await snippets.getSnippetPaths(sourceDirectory);

  const spokenFormsInverted: SpokenForms = {
    insertion: swapKeyValue(spokenForms.insertion),
    insertionWithPhrase: swapKeyValue(spokenForms.insertionWithPhrase),
    wrapper: swapKeyValue(spokenForms.wrapper),
  };

  const result: Result = {
    migrated: {},
    migratedPartially: {},
    skipped: [],
  };

  for (const file of files) {
    await migrateFile(result, spokenFormsInverted, targetDirectory, file);
  }

  await openResultDocument(result, sourceDirectory, targetDirectory);
}

async function migrateFile(
  result: Result,
  spokenForms: SpokenForms,
  targetDirectory: string,
  filePath: string,
) {
  const fileName = path.basename(filePath, CURSORLESS_SNIPPETS_SUFFIX);
  const legacySnippetFile = await readLegacyFile(filePath);

  const [communitySnippetFile, hasSkippedSnippet] = migrateLegacySnippet(
    spokenForms,
    legacySnippetFile,
  );

  if (communitySnippetFile.snippets.length === 0) {
    result.skipped.push(fileName);
    return;
  }

  const destinationName = await saveSnippetFile(
    communitySnippetFile,
    targetDirectory,
    fileName,
  );

  if (hasSkippedSnippet) {
    result.migratedPartially[fileName] = destinationName;
  } else {
    result.migrated[fileName] = destinationName;
  }
}

export function migrateLegacySnippet(
  spokenForms: SpokenForms,
  legacySnippetFile: SnippetMap,
): [SnippetFile, boolean] {
  const communitySnippetFile: SnippetFile = { snippets: [] };
  const snippetNames = Object.keys(legacySnippetFile);
  const useHeader = snippetNames.length === 1;
  let hasSkippedSnippet = false;

  for (const snippetName of snippetNames) {
    const snippet = legacySnippetFile[snippetName];
    let phrase = spokenForms.insertion[snippetName];

    if (!phrase) {
      const key = Object.keys(spokenForms.insertionWithPhrase).find((key) =>
        key.startsWith(`${snippetName}.`),
      );
      if (key) {
        phrase = spokenForms.insertionWithPhrase[key];
      }
    }

    const phrases = phrase ? [phrase] : undefined;

    if (useHeader) {
      communitySnippetFile.header = {
        name: snippetName,
        description: snippet.description,
        phrases: phrases,
        variables: parseVariables({
          spokenForms,
          snippetName,
          snippetVariables: snippet.variables,
          defVariables: undefined,
          addMissingPhrases: true,
          addMissingInsertionFormatters: false,
        }),
        insertionScopes: snippet.insertionScopeTypes,
      };
    }

    for (const def of snippet.definitions) {
      if (
        def.scope?.scopeTypes?.length ||
        def.scope?.excludeDescendantScopeTypes?.length
      ) {
        hasSkippedSnippet = true;
        continue;
      }
      communitySnippetFile.snippets.push({
        name: useHeader ? undefined : snippetName,
        description: useHeader ? undefined : snippet.description,
        phrases: useHeader ? undefined : phrases,
        insertionScopes: useHeader ? undefined : snippet.insertionScopeTypes,
        languages: def.scope?.langIds,
        variables: parseVariables({
          spokenForms,
          snippetName,
          snippetVariables: useHeader ? undefined : snippet.variables,
          defVariables: def.variables,
          addMissingPhrases: !useHeader,
          addMissingInsertionFormatters: true,
        }),
        // SKIP: def.scope?.scopeTypes
        // SKIP: def.scope?.excludeDescendantScopeTypes
        body: def.body.map((line) => line.replaceAll("\t", "    ")),
      });
    }
  }

  return [communitySnippetFile, hasSkippedSnippet];
}

interface ParseVariablesOpts {
  spokenForms: SpokenForms;
  snippetName: string;
  snippetVariables: Record<string, SnippetVariableLegacy> | undefined;
  defVariables: Record<string, SnippetVariableLegacy> | undefined;
  addMissingPhrases: boolean;
  addMissingInsertionFormatters: boolean;
}

function parseVariables({
  spokenForms,
  snippetName,
  snippetVariables,
  defVariables,
  addMissingPhrases,
  addMissingInsertionFormatters,
}: ParseVariablesOpts): SnippetVariable[] {
  const map: Record<string, SnippetVariable> = {};

  const add = (name: string, variable: SnippetVariableLegacy) => {
    if (!map[name]) {
      const phrase = spokenForms.wrapper[`${snippetName}.${name}`];
      map[name] = {
        name,
        wrapperPhrases: phrase ? [phrase] : undefined,
      };
    }
    if (variable.wrapperScopeType) {
      map[name].wrapperScope = variable.wrapperScopeType;
    }
    if (variable.formatter) {
      map[name].insertionFormatters = getFormatter(variable.formatter);
    }
    // SKIP: variable.description
  };

  Object.entries(snippetVariables ?? {}).forEach(([name, variable]) =>
    add(name, variable),
  );
  Object.entries(defVariables ?? {}).forEach(([name, variable]) =>
    add(name, variable),
  );

  if (addMissingPhrases) {
    for (const key in spokenForms.wrapper) {
      const [snipName, variableName] = key.split(".");
      if (snipName === snippetName && !map[variableName]) {
        map[variableName] = {
          name: variableName,
          wrapperPhrases: [spokenForms.wrapper[key]],
        };
      }
    }
  }

  if (addMissingInsertionFormatters) {
    for (const key in spokenForms.insertionWithPhrase) {
      const [snipName, variableName] = key.split(".");
      if (snipName === snippetName) {
        if (!map[variableName]) {
          map[variableName] = { name: variableName };
        }
        if (!map[variableName].insertionFormatters) {
          map[variableName].insertionFormatters = ["NOOP"];
        }
      }
    }
  }

  return Object.values(map);
}

// Convert Cursorless formatters to Talon community formatters
function getFormatter(formatter: string): string[] {
  switch (formatter) {
    case "camelCase":
      return ["PRIVATE_CAMEL_CASE"];
    case "pascalCase":
      return ["PUBLIC_CAMEL_CASE"];
    case "snakeCase":
      return ["SNAKE_CASE"];
    case "upperSnakeCase":
      return ["ALL_CAPS", "SNAKE_CASE"];
    default:
      return [formatter];
  }
}

async function saveSnippetFile(
  communitySnippetFile: SnippetFile,
  targetDirectory: string,
  fileName: string,
) {
  let destinationName: string;

  try {
    destinationName = `${fileName}.snippet`;
    const destinationPath = path.join(targetDirectory, destinationName);
    await writeCommunityFile(communitySnippetFile, destinationPath, "wx");
  } catch (error: any) {
    if (error.code === "EEXIST") {
      destinationName = `${fileName}_CONFLICT.snippet`;
      const destinationPath = path.join(targetDirectory, destinationName);
      await writeCommunityFile(communitySnippetFile, destinationPath, "w");
    } else {
      throw error;
    }
  }

  return destinationName;
}

async function openResultDocument(
  result: Result,
  sourceDirectory: string,
  targetDirectory: string,
) {
  const migratedKeys = Object.keys(result.migrated).sort();
  const migratedPartiallyKeys = Object.keys(result.migratedPartially).sort();
  const skipMessage =
    "(Snippets containing `scopeTypes` and/or `excludeDescendantScopeTypes` attributes are not supported by community snippets.)";

  const content: string[] = [
    `# Snippets migrated from Cursorless`,
    "",
    `From: ${sourceDirectory}`,
    `To:   ${targetDirectory}`,
    "",
  ];

  if (result.skipped.length > 0) {
    content.push(
      `## Skipped ${result.skipped.length} snippet files:`,
      ...result.skipped.map((key) => `- ${key}`),
      skipMessage,
      "",
    );
  }

  if (migratedPartiallyKeys.length > 0) {
    content.push(
      `## Migrated ${migratedPartiallyKeys.length} snippet files partially:`,
      ...migratedPartiallyKeys.map(
        (key) => `- ${key} -> ${result.migratedPartially[key]}`,
      ),
      skipMessage,
      "",
    );
  }

  content.push(
    `## Migrated ${migratedKeys.length} snippet files:`,
    ...migratedKeys.map((key) => `- ${key} -> ${result.migrated[key]}`),
    "",
  );

  const textDocument = await vscode.workspace.openTextDocument({
    content: content.join("\n"),
    language: "markdown",
  });
  await vscode.window.showTextDocument(textDocument);
}

async function readLegacyFile(filePath: string): Promise<SnippetMap> {
  const content = await fs.readFile(filePath, "utf8");
  if (content.length === 0) {
    return {};
  }
  return JSON.parse(content);
}

async function writeCommunityFile(
  snippetFile: SnippetFile,
  filePath: string,
  flags: string,
) {
  const snippetText = serializeSnippetFile(snippetFile);
  const file = await fs.open(filePath, flags);
  try {
    await file.write(snippetText);
  } finally {
    await file.close();
  }
}

function swapKeyValue(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key]),
  );
}
