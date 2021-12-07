import { SyntaxNode } from "web-tree-sitter";
import { SelectionWithEditor } from "../typings/Types";
import { textFragmentExtractor as jsonTextFragmentExtractor } from "./json";
import { UnsupportedLanguageError } from "../errors";
import { Range } from "vscode";
import { SupportedLanguageId } from "./constants";
import { getNodeRange, makeRangeFromPositions } from "../util/nodeSelectors";
import { getNodeMatcher } from "./index";

export type TextFragmentExtractor = (
  node: SyntaxNode,
  selection: SelectionWithEditor
) => Range | null;

function constructDefaultTextFragmentExtractor(
  languageId: SupportedLanguageId
): TextFragmentExtractor {
  const stringNodeMatcher = getNodeMatcher(languageId, "string", false);
  const commentNodeMatcher = getNodeMatcher(languageId, "comment", false);

  return (node: SyntaxNode, selection: SelectionWithEditor) => {
    const isStringNode = stringNodeMatcher(selection, node) != null;

    if (isStringNode || commentNodeMatcher(selection, node) != null) {
      if (isStringNode) {
        const children = node.children;

        return makeRangeFromPositions(
          children[0].endPosition,
          children[children.length - 1].startPosition
        );
      } else {
        return getNodeRange(node);
      }
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
  java: constructDefaultTextFragmentExtractor("java"),
  javascript: constructDefaultTextFragmentExtractor("javascript"),
  javascriptreact: constructDefaultTextFragmentExtractor("javascriptreact"),
  jsonc: jsonTextFragmentExtractor,
  json: jsonTextFragmentExtractor,
  python: constructDefaultTextFragmentExtractor("python"),
  typescript: constructDefaultTextFragmentExtractor("typescript"),
  typescriptreact: constructDefaultTextFragmentExtractor("typescriptreact"),
};
