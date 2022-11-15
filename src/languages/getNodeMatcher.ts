import { SyntaxNode } from "web-tree-sitter";
import { notSupported } from "../util/nodeMatchers";
import { selectionWithEditorFromRange } from "../util/selectionUtils";
import {
  NodeMatcher,
  NodeMatcherValue,
  SelectionWithEditor,
} from "../typings/Types";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";
import cpp from "./cpp";
import clojure from "./clojure";
import csharp from "./csharp";
import { patternMatchers as json } from "./json";
import { patternMatchers as typescript } from "./typescript";
import java from "./java";
import { patternMatchers as html } from "./html";
import php from "./php";
import python from "./python";
import markdown from "./markdown";
import scala from "./scala";
import { patternMatchers as scss } from "./scss";
import go from "./go";
import latex from "./latex";
import { patternMatchers as ruby } from "./ruby";
import rust from "./rust";
import { UnsupportedLanguageError } from "../errors";
import { SupportedLanguageId } from "../libs/cursorless-engine/languages/constants";

export function getNodeMatcher(
  languageId: string,
  scopeTypeType: SimpleScopeTypeType,
  includeSiblings: boolean,
): NodeMatcher {
  const matchers = languageMatchers[languageId as SupportedLanguageId];

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

const languageMatchers: Record<
  SupportedLanguageId,
  Record<SimpleScopeTypeType, NodeMatcher>
> = {
  c: cpp,
  cpp,
  css: scss,
  csharp,
  clojure,
  go,
  html,
  java,
  javascript: typescript,
  javascriptreact: typescript,
  json,
  jsonc: json,
  latex,
  markdown,
  php,
  python,
  ruby,
  scala,
  scss,
  rust,
  typescript,
  typescriptreact: typescript,
  xml: html,
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
