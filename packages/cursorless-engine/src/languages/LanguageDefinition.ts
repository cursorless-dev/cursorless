import { ScopeType, SimpleScopeType } from "@cursorless/common";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { Query } from "web-tree-sitter";
import { TreeSitterScopeHandler } from "../processTargets/modifiers/scopeHandlers";
import { ide } from "../singletons/ide.singleton";
import { TreeSitter } from "../typings/TreeSitter";
import { LanguageId } from "./constants";
import { TreeSitterQuery } from "./TreeSitterQuery";

/**
 * Represents a language definition for a single language, including the
 * tree-sitter query used to extract scopes for the given language
 */
export class LanguageDefinition {
  private query: TreeSitterQuery;

  private constructor(
    treeSitter: TreeSitter,
    /**
     * The tree-sitter query used to extract scopes for the given language.
     * Note that this query contains patterns for all scope types that the
     * language supports using new-style tree-sitter queries
     */
    query: Query,
  ) {
    this.query = new TreeSitterQuery(treeSitter, query);
  }

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
    languageId: LanguageId,
  ): LanguageDefinition | undefined {
    const queryPath = join(ide().assetsRoot, "queries", `${languageId}.scm`);

    if (!existsSync(queryPath)) {
      return undefined;
    }

    const rawLanguageQueryString = readFileSync(queryPath, "utf8");

    return new LanguageDefinition(
      treeSitter,
      treeSitter.getLanguage(languageId)!.query(rawLanguageQueryString),
    );
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
