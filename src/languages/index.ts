import {
  NodeMatcher,
  NodeMatcherValue,
  ScopeType,
  SelectionWithEditor,
} from "../Types";
import json from "./json";
import python from "./python";
import typescript from "./typescript";
import csharp from "./csharp";
import java from "./java";
import { notSupported } from "../nodeMatchers";
import { SyntaxNode } from "web-tree-sitter";
import { selectionWithEditorFromRange } from "../selectionUtils";

const languageMatchers: Record<string, Record<ScopeType, NodeMatcher>> = {
  csharp: csharp,
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  python,
  typescript,
  typescriptreact: typescript,
  java,
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
    const matches = matcher(selection, node);
    if (matches == null) {
      return null;
    }
    return matches
      .flatMap((match) =>
        match.node.parent!.namedChildren.flatMap((sibling) =>
          matcher(
            selectionWithEditorFromRange(selection, match.selection.selection),
            sibling
          )
        )
      )
      .filter((match) => match != null) as NodeMatcherValue[];
  };
}
