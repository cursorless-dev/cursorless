import type {
  RawTreeSitterQueryProvider,
  ScopeType,
  SimpleScopeType,
  SimpleScopeTypeType,
  TreeSitter,
} from "@cursorless/common";
import {
  matchAll,
  showError,
  type IDE,
  type TextDocument,
} from "@cursorless/common";
import { TreeSitterScopeHandler } from "../processTargets/modifiers/scopeHandlers";
import { TreeSitterQuery } from "./TreeSitterQuery";
import type { QueryCapture } from "./TreeSitterQuery/QueryCapture";
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
    treeSitterQueryProvider: RawTreeSitterQueryProvider,
    treeSitter: TreeSitter,
    languageId: string,
  ): Promise<LanguageDefinition | undefined> {
    const rawLanguageQueryString = await readQueryFileAndImports(
      ide,
      treeSitterQueryProvider,
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
    if (!this.query.hasCapture(scopeType.type)) {
      return undefined;
    }

    return new TreeSitterScopeHandler(this.query, scopeType as SimpleScopeType);
  }

  /**
   * This is a low-level function that just returns a map of all captures in the
   * document. We use this in our surrounding pair code.
   *
   * @param document The document to search
   * @param captureName The name of a capture to search for
   * @returns A map of captures in the document
   */
  getCapturesMap(document: TextDocument) {
    const matches = this.query.matches(document);
    const result: Partial<Record<SimpleScopeTypeType, QueryCapture[]>> = {};

    for (const match of matches) {
      for (const capture of match.captures) {
        const name = capture.name as SimpleScopeTypeType;
        if (result[name] == null) {
          result[name] = [];
        }
        result[name]!.push(capture);
      }
    }

    return result;
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
  provider: RawTreeSitterQueryProvider,
  languageQueryName: string,
) {
  // Seed the map with the query file itself
  const rawQueryStrings: Record<string, string | null> = {
    [languageQueryName]: null,
  };

  const doValidation = ide.runMode !== "production";

  // Keep reading imports until we've read all the imports. Every time we
  // encounter an import in a query file, we add it to the map with a value
  // of null, so that it will be read on the next iteration
  while (Object.values(rawQueryStrings).some((v) => v == null)) {
    for (const [queryName, rawQueryString] of Object.entries(rawQueryStrings)) {
      if (rawQueryString != null) {
        continue;
      }

      let rawQuery = await provider.readQuery(queryName);

      if (rawQuery == null) {
        if (queryName === languageQueryName) {
          // If this is the main query file, then we know that this language
          // just isn't defined using new-style queries
          return undefined;
        }

        void showError(
          ide.messages,
          "LanguageDefinition.readQueryFileAndImports.queryNotFound",
          `Could not find imported query file ${queryName}`,
        );

        if (ide.runMode === "test") {
          throw new Error("Invalid import statement");
        }

        // If we're not in test mode, we just ignore the import and continue
        rawQuery = "";
      }

      if (doValidation) {
        validateQueryCaptures(queryName, rawQuery);
      }

      rawQueryStrings[queryName] = rawQuery;
      matchAll(
        rawQuery,
        // Matches lines like:
        //
        // ;; import path/to/query.scm
        //
        // but is very lenient about whitespace and quotes, and also allows
        // include instead of import, so that we can throw a nice error message
        // if the developer uses the wrong syntax
        /^[^\S\r\n]*;;?[^\S\r\n]*(?:import|include)[^\S\r\n]+['"]?([\w|/\\.]+)['"]?[^\S\r\n]*$/gm,
        (match) => {
          const importName = match[1];

          if (doValidation) {
            validateImportSyntax(ide, queryName, importName, match[0]);
          }

          rawQueryStrings[importName] = rawQueryStrings[importName] ?? null;
        },
      );
    }
  }

  return Object.values(rawQueryStrings).join("\n");
}

function validateImportSyntax(
  ide: IDE,
  file: string,
  importName: string,
  actual: string,
) {
  let isError = false;

  if (/[/\\]/g.test(importName)) {
    void showError(
      ide.messages,
      "LanguageDefinition.readQueryFileAndImports.invalidImport",
      `Invalid import statement in ${file}: "${actual}". Relative import paths not supported`,
    );

    isError = true;
  }

  const canonicalSyntax = `;; import ${importName}`;
  if (actual !== canonicalSyntax) {
    void showError(
      ide.messages,
      "LanguageDefinition.readQueryFileAndImports.malformedImport",
      `Malformed import statement in ${file}: "${actual}". Import statements must be of the form "${canonicalSyntax}"`,
    );

    isError = true;
  }

  if (isError && ide.runMode === "test") {
    throw new Error("Invalid import statement");
  }
}
