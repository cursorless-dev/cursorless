import {
  SimpleScopeTypeType,
  UnsupportedLanguageError,
} from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import {
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../typings/Types";
import { notSupported } from "../util/nodeMatchers";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import { LegacyLanguageId } from "./LegacyLanguageId";
import clojure from "./clojure";
import cpp from "./cpp";
import csharp from "./csharp";
import elm from "./elm";
import go from "./go";
import java from "./java";
import latex from "./latex";
import markdown from "./markdown";
import php from "./php";
import python from "./python";
import { patternMatchers as ruby } from "./ruby";
import rust from "./rust";
import scala from "./scala";
import { patternMatchers as scss } from "./scss";

export function getNodeMatcher(
  languageId: string,
  scopeTypeType: SimpleScopeTypeType,
  includeSiblings: boolean,
): NodeMatcher {
  const matchers = languageMatchers[languageId as LegacyLanguageId];

  if (matchers == null) {
    throw new UnsupportedLanguageError(languageId);
  }

  const matcher = matchers[scopeTypeType];

  if (matcher == null) {
    return notSupported;
  }

  if (includeSiblings) {
    return matcherIncludeSiblings(matcher);
  }

  return matcher;
}

export const languageMatchers: Record<
  LegacyLanguageId,
  Partial<Record<SimpleScopeTypeType, NodeMatcher>>
> = {
  c: cpp,
  cpp,
  css: scss,
  csharp,
  clojure,
  elm,
  go,
  java,
  latex,
  markdown,
  php,
  python,
  ruby,
  scala,
  scss,
  rust,
};

function matcherIncludeSiblings(matcher: NodeMatcher): NodeMatcher {
  return (
    selection: SelectionWithEditor,
    node: SyntaxNode,
  ): NodeMatcherValue[] | null => {
    let matches = matcher(selection, node);
    if (matches == null) {
      return null;
    }
    matches = matches.flatMap((match) =>
      iterateNearestIterableAncestor(
        match.node,
        selectionWithEditorFromRange(selection, match.selection.selection),
        matcher,
      ),
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
  nodeMatcher: NodeMatcher,
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
