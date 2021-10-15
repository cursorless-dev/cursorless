import { SyntaxNode } from "web-tree-sitter";
import { notSupported } from "../util/nodeMatchers";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import {
  NodeMatcher,
  NodeMatcherValue,
  ScopeType,
  SelectionWithEditor,
  SnippetName,
} from "../typings/Types";
import * as cpp from "./cpp";
import * as csharp from "./csharp";
import * as java from "./java";
import json from "./json";
import * as python from "./python";
import * as typescript from "./typescript";
import { SnippetString } from "vscode";

const languageMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  c: cpp.patternMatchers,
  cpp: cpp.patternMatchers,
  csharp: csharp.patternMatchers,
  java: java.patternMatchers,
  javascript: typescript.patternMatchers,
  javascriptreact: typescript.patternMatchers,
  json,
  jsonc: json,
  python: python.patternMatchers,
  typescript: typescript.patternMatchers,
  typescriptreact: typescript.patternMatchers,
};

export const snippets: Record<
  string,
  Partial<Record<SnippetName, SnippetString>>
> = {
  c: cpp.snippets,
  cpp: cpp.snippets,
  csharp: csharp.snippets,
  java: java.snippets,
  javascript: typescript.snippets,
  javascriptreact: typescript.snippets,
  python: python.snippets,
  typescript: typescript.snippets,
  typescriptreact: typescript.snippets,
};

export function getNodeMatcher(
  languageId: string,
  scopeType: ScopeType,
  includeSiblings: boolean
): NodeMatcher {
  const matchers = languageMatchers[languageId];

  if (matchers == null) {
    throw Error(
      `Language '${languageId}' is not implemented yet; See https://github.com/pokey/cursorless-vscode/blob/main/docs/adding-a-new-language.md`
    );
  }

  const matcher = matchers[scopeType];

  if (matcher == null) {
    return notSupported;
  }

  if (includeSiblings) {
    return matcherIncludeSiblings(matcher);
  }

  return matcher;
}

function matcherIncludeSiblings(matcher: NodeMatcher): NodeMatcher {
  return (
    selection: SelectionWithEditor,
    node: SyntaxNode
  ): NodeMatcherValue[] | null => {
    let matches = matcher(selection, node);
    if (matches == null) {
      return null;
    }
    matches = matches.flatMap((match) =>
      iterateNearestIterableAncestor(
        match.node,
        selectionWithEditorFromRange(selection, match.selection.selection),
        matcher
      )
    ) as NodeMatcherValue[];
    if (matches.length > 0) {
      return matches;
    }
    return null;
  };
}

function iterateNearestIterableAncestor(
  node: SyntaxNode,
  selection: SelectionWithEditor,
  nodeMatcher: NodeMatcher
) {
  let parent: SyntaxNode | null = node.parent;
  while (parent != null) {
    const matches = parent!.namedChildren
      .flatMap((sibling) => nodeMatcher(selection, sibling))
      .filter((match) => match != null) as NodeMatcherValue[];
    if (matches.length > 0) {
      return matches;
    }
    parent = parent.parent;
  }
  return [];
}
