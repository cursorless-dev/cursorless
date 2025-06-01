import { UnsupportedLanguageError } from "@cursorless/common";
import type { Node } from "web-tree-sitter";
import type { SimpleScopeTypeType } from "@cursorless/common";
import type {
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../typings/Types";
import { notSupported } from "../util/nodeMatchers";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import clojure from "./clojure";
import type { LegacyLanguageId } from "./LegacyLanguageId";
import latex from "./latex";
import { patternMatchers as ruby } from "./ruby";
import rust from "./rust";

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
    return notSupported(scopeTypeType);
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
  clojure,
  latex,
  ruby,
  rust,
};

function matcherIncludeSiblings(matcher: NodeMatcher): NodeMatcher {
  return (
    selection: SelectionWithEditor,
    node: Node,
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
    );
    if (matches.length > 0) {
      return matches;
    }
    return null;
  };
}

function iterateNearestIterableAncestor(
  node: Node,
  selection: SelectionWithEditor,
  nodeMatcher: NodeMatcher,
) {
  let parent: Node | null = node.parent;
  while (parent != null) {
    const matches = parent.namedChildren
      .flatMap((sibling) => nodeMatcher(selection, sibling))
      .filter((match) => match != null) as NodeMatcherValue[];
    if (matches.length > 0) {
      return matches;
    }
    parent = parent.parent;
  }
  return [];
}
