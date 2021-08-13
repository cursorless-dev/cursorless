import { SyntaxNode } from "web-tree-sitter";
import { notSupported } from "../nodeMatchers";
import { selectionWithEditorFromRange } from "../selectionUtils";
import {
  NodeMatcher,
  NodeMatcherValue,
  ScopeType,
  SelectionWithEditor,
} from "../Types";
import cpp from "./cpp";
import csharp from "./csharp";
import java from "./java";
import json from "./json";
import python from "./python";
import typescript from "./typescript";

const languageMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  c: cpp,
  cpp: cpp,
  csharp: csharp,
  java,
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  python,
  typescript,
  typescriptreact: typescript,
};

export function getNodeMatcher(
  languageId: string,
  scopeType: ScopeType,
  includeSiblings: boolean
): NodeMatcher {
  const matchers = languageMatchers[languageId];

  if (matchers == null) {
    throw Error(
      `Language '${languageId}' is not implemented yet; See https://github.com/pokey/cursorless-vscode/blob/master/docs/adding-a-new-language.md`
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
      findNearestContainingAncestorNode(
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

function findNearestContainingAncestorNode(
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
