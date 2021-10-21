import { ScopeType } from "./Types";

export interface SnippetScope {
  langIds?: string[];
  scopeType?: ScopeType;
}

export type SnippetBody = string[];

export interface SnippetDefinition {
  body: SnippetBody;
  scope?: SnippetScope;
}

export interface Snippet {
  definitions: SnippetDefinition[];
  defaultScopeTypes: Record<string, ScopeType>;
  description?: string;
}
