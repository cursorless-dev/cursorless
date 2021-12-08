import { SyntaxNode } from "web-tree-sitter";
import { SelectionWithEditor } from "../typings/Types";
import { stringTextFragmentExtractor as jsonStringTextFragmentExtractor } from "./json";
import { stringTextFragmentExtractor as javaStringTextFragmentExtractor } from "./java";
import { UnsupportedLanguageError } from "../errors";
import { Range } from "vscode";
import { SupportedLanguageId } from "./constants";
import { getNodeRange, makeRangeFromPositions } from "../util/nodeSelectors";
import { getNodeMatcher } from "./getNodeMatcher";
import { notSupported } from "../util/nodeMatchers";

export type TextFragmentExtractor = (
  node: SyntaxNode,
  selection: SelectionWithEditor
) => Range | null;

function constructDefaultTextFragmentExtractor(
  languageId: SupportedLanguageId,
  stringTextFragmentExtractor?: TextFragmentExtractor
): TextFragmentExtractor {
  const commentNodeMatcher = getNodeMatcher(languageId, "comment", false);
  stringTextFragmentExtractor =
    stringTextFragmentExtractor ??
    constructDefaultStringTextFragmentExtractor(languageId);

  return (node: SyntaxNode, selection: SelectionWithEditor) => {
    const stringTextFragment = stringTextFragmentExtractor!(node, selection);

    if (stringTextFragment != null) {
      return stringTextFragment;
    }

    if (
      commentNodeMatcher !== notSupported &&
      commentNodeMatcher(selection, node) != null
    ) {
      return getNodeRange(node);
    }

    return null;
  };
}

function constructDefaultStringTextFragmentExtractor(
  languageId: SupportedLanguageId
): TextFragmentExtractor {
  const stringNodeMatcher = getNodeMatcher(languageId, "string", false);

  return (node: SyntaxNode, selection: SelectionWithEditor) => {
    if (stringNodeMatcher(selection, node) != null) {
      const children = node.children;

      return makeRangeFromPositions(
        children[0].endPosition,
        children[children.length - 1].startPosition
      );
    }

    return null;
  };
}

export default function getTextFragmentExtractor(
  languageId: string
): TextFragmentExtractor {
  const extractor = textFragmentExtractors[languageId as SupportedLanguageId];

  if (extractor == null) {
    throw new UnsupportedLanguageError(languageId);
  }

  return extractor;
}

const textFragmentExtractors: Record<
  SupportedLanguageId,
  TextFragmentExtractor
> = {
  c: constructDefaultTextFragmentExtractor("c"),
  cpp: constructDefaultTextFragmentExtractor("cpp"),
  csharp: constructDefaultTextFragmentExtractor("csharp"),
  java: constructDefaultTextFragmentExtractor(
    "java",
    javaStringTextFragmentExtractor
  ),
  javascript: constructDefaultTextFragmentExtractor("javascript"),
  javascriptreact: constructDefaultTextFragmentExtractor("javascriptreact"),
  jsonc: constructDefaultTextFragmentExtractor(
    "jsonc",
    jsonStringTextFragmentExtractor
  ),
  json: constructDefaultTextFragmentExtractor(
    "json",
    jsonStringTextFragmentExtractor
  ),
  python: constructDefaultTextFragmentExtractor("python"),
  typescript: constructDefaultTextFragmentExtractor("typescript"),
  typescriptreact: constructDefaultTextFragmentExtractor("typescriptreact"),
};
