import { SyntaxNode } from "web-tree-sitter";
import { notSupported } from "../util/nodeMatchers";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import {
  NodeMatcher,
  NodeMatcherValue,
  ScopeType,
  SelectionWithEditor,
} from "../typings/Types";
import cpp from "./cpp";
import csharp from "./csharp";
import java, {
  getStringContentRange as javaGetStringContentRange,
} from "./java";
import json from "./json";
import python from "./python";
import typescript from "./typescript";
import { makeRangeFromPositions } from "../util/nodeSelectors";
import { Range } from "vscode";

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

type StringContentRangeGetter = (node: SyntaxNode) => Range;

function getDefaultStringContentRange(node: SyntaxNode): Range {
  return makeRangeFromPositions(
    node.children[0].endPosition,
    node.children[node.children.length - 1].startPosition
  );
}

export const stringContentRangeGetters: Record<
  string,
  StringContentRangeGetter
> = {
  c: getDefaultStringContentRange,
  cpp: getDefaultStringContentRange,
  csharp: getDefaultStringContentRange,
  java: javaGetStringContentRange,
  javascript: getDefaultStringContentRange,
  javascriptreact: getDefaultStringContentRange,
  json: getDefaultStringContentRange,
  jsonc: getDefaultStringContentRange,
  python: getDefaultStringContentRange,
  typescript: getDefaultStringContentRange,
  typescriptreact: getDefaultStringContentRange,
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
