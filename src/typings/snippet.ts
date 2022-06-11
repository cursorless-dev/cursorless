import { SimpleScopeTypeType } from "./targetDescriptor.types";
import { TextFormatterName } from "./Types";

export interface SnippetScope {
  langIds?: string[];
  scopeType?: SimpleScopeTypeType;
}

export type SnippetBody = string[];

export interface SnippetDefinition {
  body: SnippetBody;

  /**
   * Scopes where this snippet is active
   */
  scope?: SnippetScope;

  /**
   * Scope-specific overrides for the variable
   */
  variables?: Record<string, SnippetVariable>;
}

export interface SnippetVariable {
  /**
   * Default to this scope type when wrapping a target without scope type
   * specified.
   */
  wrapperScopeType?: SimpleScopeTypeType;

  /**
   * Description of the snippet variable
   */
  description?: string;

  /**
   * Format text inserted into this variable using the given formatter
   */
  formatter?: TextFormatterName;
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

  /**
   * Default to this scope type when inserting this snippet before/after a
   * target without scope type specified
   */
  insertionScopeType?: SimpleScopeTypeType;
}

export type SnippetMap = Record<string, Snippet>;
