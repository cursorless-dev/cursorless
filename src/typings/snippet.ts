import { ScopeType } from "./Types";

export interface SnippetScope {
  langIds?: string[];
  scopeType?: ScopeType;
}

export type SnippetBody = string[];

export interface SnippetDefinition {
  body: SnippetBody;

  /**
   * Scopes where this snippet is active
   */
  scope?: SnippetScope;
}

export interface SnippetVariable {
  /**
   * Default to this scope type when wrapping a target without scope type
   * specified.
   */
  wrapperScopeType?: ScopeType;

  /**
   * Description of the snippet variable
   */
  description?: string;
}

export interface Snippet {
  /**
   * List of possible definitions for this snippet
   */
  definitions: SnippetDefinition[];

  /**
   * For each named variable in the snippet, provides extra information about the variable.
   */
  variables?: Record<string, SnippetVariable>;

  /**
   * Description of the snippet
   */
  description?: string;
}

export type SnippetMap = Record<string, Snippet>;
