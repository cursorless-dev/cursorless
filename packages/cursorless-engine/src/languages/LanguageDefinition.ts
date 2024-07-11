import {
  ScopeType,
  SimpleScopeType,
  showError,
  type IDE,
  type LanguageDefinitionsProvider,
} from "@cursorless/common";
import { dirname, join } from "pathe";
import { TreeSitterScopeHandler } from "../processTargets/modifiers/scopeHandlers";
import { TreeSitter } from "../typings/TreeSitter";
import { matchAll } from "../util/regex";
import { TreeSitterQuery } from "./TreeSitterQuery";
import { validateQueryCaptures } from "./TreeSitterQuery/validateQueryCaptures";

/**
 * Represents a language definition for a single language, including the
 * tree-sitter query used to extract scopes for the given language
 */
export class LanguageDefinition {
  private constructor(
    /**
     * The tree-sitter query used to extract scopes for the given language.
     * Note that this query contains patterns for all scope types that the
     * language supports using new-style tree-sitter queries
     */
    private query: TreeSitterQuery,
  ) {}

  /**
   * Construct a language definition for the given language id, if the language
   * has a new-style query definition, or return undefined if the language doesn't
   *
   * @param treeSitter The tree-sitter instance to use for parsing
   * @param languageId The language id for which to create a language definition
   * @returns A language definition for the given language id, or undefined if the given language
   * id doesn't have a new-style query definition
   */
  static async create(
    ide: IDE,
    provider: LanguageDefinitionsProvider,
    treeSitter: TreeSitter,
    languageId: string,
  ): Promise<LanguageDefinition | undefined> {
    const rawLanguageQueryString = await readQueryFileAndImports(
      ide,
      provider,
      `${languageId}.scm`,
    );

    if (rawLanguageQueryString == null) {
      return undefined;
    }

    if (!(await treeSitter.loadLanguage(languageId))) {
      return undefined;
    }

    const rawQuery = treeSitter
      .getLanguage(languageId)!
      .query(rawLanguageQueryString);
    const query = TreeSitterQuery.create(languageId, treeSitter, rawQuery);

    return new LanguageDefinition(query);
  }

  /**
   * @param scopeType The scope type for which to get a scope handler
   * @returns A scope handler for the given scope type and language id, or
   * undefined if the given scope type / language id combination is still using
   * legacy pathways
   */
  getScopeHandler(scopeType: ScopeType) {
    if (!this.query.captureNames.includes(scopeType.type)) {
      return undefined;
    }

    return new TreeSitterScopeHandler(this.query, scopeType as SimpleScopeType);
  }
}

/**
 * Reads a query file and all its imports, and returns the text of the query
 * file with all imports inlined. This is necessary because tree-sitter doesn't
 * support imports in query files, so we need to manually inline all the
 * imports.
 *
 * Note that we handle diamond imports correctly, so that if a query file
 * imports two files that both import the same file, we only read the file once.
 * @param languageQueryPath The path to the query file to read
 * @returns The text of the query file, with all imports inlined
 */
async function readQueryFileAndImports(
  ide: IDE,
  provider: LanguageDefinitionsProvider,
  languageFilename: string,
) {
  // Seed the map with the query file itself
  const rawQueryStrings: Record<string, string | null> = {
    [languageFilename]: null,
  };

  const doValidation = ide.runMode !== "production";

  // Keep reading imports until we've read all the imports. Every time we
  // encounter an import in a query file, we add it to the map with a value
  // of null, so that it will be read on the next iteration
  while (Object.values(rawQueryStrings).some((v) => v == null)) {
    for (const [filename, rawQueryString] of Object.entries(rawQueryStrings)) {
      if (rawQueryString != null) {
        continue;
      }

      let rawQuery = await provider.readQuery(filename);

      if (rawQuery == null) {
        if (filename === languageFilename) {
          // If this is the main query file, then we know that this language
          // just isn't defined using new-style queries
          return undefined;
        }

        showError(
          ide.messages,
          "LanguageDefinition.readQueryFileAndImports.queryNotFound",
          `Could not find imported query file ${filename}`,
        );

        if (ide.runMode === "test") {
          throw new Error("Invalid import statement");
        }

        // If we're not in test mode, we just ignore the import and continue
        rawQuery = "";
      }

      if (doValidation) {
        validateQueryCaptures(filename, rawQuery);
      }

      rawQueryStrings[filename] = rawQuery;
      matchAll(
        rawQuery,
        // Matches lines like:
        //
        // ;; import path/to/query.scm
        //
        // but is very lenient about whitespace and quotes, and also allows
        // include instead of import, so that we can throw a nice error message
        // if the developer uses the wrong syntax
        /^[^\S\r\n]*;;?[^\S\r\n]*(?:import|include)[^\S\r\n]+['"]?([\w|/.]+)['"]?[^\S\r\n]*$/gm,
        (match) => {
          const relativeImportPath = match[1];

          if (doValidation) {
            validateImportSyntax(ide, filename, relativeImportPath, match[0]);
          }

          const importQueryPath = join(dirname(filename), relativeImportPath);
          rawQueryStrings[importQueryPath] =
            rawQueryStrings[importQueryPath] ?? null;
        },
      );
    }
  }

  return Object.values(rawQueryStrings).join("\n");
}

function validateImportSyntax(
  ide: IDE,
  file: string,
  relativeImportPath: string,
  actual: string,
) {
  const canonicalSyntax = `;; import ${relativeImportPath}`;

  if (actual !== canonicalSyntax) {
    showError(
      ide.messages,
      "LanguageDefinition.readQueryFileAndImports.malformedImport",
      `Malformed import statement in ${file}: "${actual}". Import statements must be of the form "${canonicalSyntax}"`,
    );

    if (ide.runMode === "test") {
      throw new Error("Invalid import statement");
    }
  }
}
