import { ScopeType, SimpleScopeType, showError } from "@cursorless/common";
import { existsSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { TreeSitterScopeHandler } from "../processTargets/modifiers/scopeHandlers";
import { ContiguousScopeHandler } from "../processTargets/modifiers/scopeHandlers/ContiguousScopeHandler";
import { TreeSitterTextFragmentScopeHandler } from "../processTargets/modifiers/scopeHandlers/TreeSitterScopeHandler/TreeSitterTextFragmentScopeHandler";
import type { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { ide } from "../singletons/ide.singleton";
import type { TreeSitter } from "../typings/TreeSitter";
import { matchAll } from "../util/regex";
import { TreeSitterQuery } from "./TreeSitterQuery";
import { TEXT_FRAGMENT_CAPTURE_NAME } from "./captureNames";

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
  static create(
    treeSitter: TreeSitter,
    queryDir: string,
    languageId: string,
  ): LanguageDefinition | undefined {
    const languageQueryPath = join(queryDir, `${languageId}.scm`);

    if (!existsSync(languageQueryPath)) {
      return undefined;
    }

    const rawLanguageQueryString = readQueryFileAndImports(languageQueryPath);

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
  getScopeHandler(scopeType: ScopeType): ScopeHandler | undefined {
    if (!this.query.captureNames.includes(scopeType.type)) {
      return undefined;
    }

    const scopeHandler = new TreeSitterScopeHandler(
      this.query,
      scopeType as SimpleScopeType,
    );

    if (useContiguousScopeHandler(scopeType)) {
      return new ContiguousScopeHandler(scopeHandler);
    }

    return scopeHandler;
  }

  getTextFragmentScopeHandler(): ScopeHandler | undefined {
    if (!this.query.captureNames.includes(TEXT_FRAGMENT_CAPTURE_NAME)) {
      return undefined;
    }

    return new TreeSitterTextFragmentScopeHandler(this.query);
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
function readQueryFileAndImports(languageQueryPath: string) {
  // Seed the map with the query file itself
  const rawQueryStrings: Record<string, string | null> = {
    [languageQueryPath]: null,
  };

  // Keep reading imports until we've read all the imports. Every time we
  // encounter an import in a query file, we add it to the map with a value
  // of null, so that it will be read on the next iteration
  while (Object.values(rawQueryStrings).some((v) => v == null)) {
    for (const [queryPath, rawQueryString] of Object.entries(rawQueryStrings)) {
      if (rawQueryString != null) {
        continue;
      }

      const rawQuery = readFileSync(queryPath, "utf8");
      rawQueryStrings[queryPath] = rawQuery;
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
          const canonicalSyntax = `;; import ${relativeImportPath}`;

          if (match[0] !== canonicalSyntax) {
            showError(
              ide().messages,
              "LanguageDefinition.readQueryFileAndImports.malformedImport",
              `Malformed import statement in ${queryPath}: "${match[0]}". Import statements must be of the form "${canonicalSyntax}"`,
            );

            if (ide().runMode === "test") {
              throw new Error("Invalid import statement");
            }
          }

          const importQueryPath = join(dirname(queryPath), relativeImportPath);
          rawQueryStrings[importQueryPath] =
            rawQueryStrings[importQueryPath] ?? null;
        },
      );
    }
  }

  return Object.values(rawQueryStrings).join("\n");
}

/**
 * Returns true if the given scope type should use a contiguous scope handler.
 */
function useContiguousScopeHandler(scopeType: ScopeType): boolean {
  switch (scopeType.type) {
    case "comment":
      return true;
    default:
      return false;
  }
}
