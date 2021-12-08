import { SyntaxNode } from "web-tree-sitter";
import { SelectionWithEditor } from "../typings/Types";
import { stringTextFragmentExtractor as jsonStringTextFragmentExtractor } from "./json";
import { stringTextFragmentExtractor as javaStringTextFragmentExtractor } from "./java";
import { stringTextFragmentExtractor as typescriptStringTextFragmentExtractor } from "./typescript";
import { UnsupportedLanguageError } from "../errors";
import { Range } from "vscode";
import { SupportedLanguageId } from "./constants";
import {
  getNodeInternalRange,
  getNodeRange,
  makeRangeFromPositions,
} from "../util/nodeSelectors";
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

    // Treat error nodes as raw text so that the surrounding pair matcher can
    // still be useful when we have a bad parse tree
    if (node.type === "ERROR") {
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
      // Exclude starting and ending quotation marks
      return getNodeInternalRange(node);
    }

    return null;
  };
}

/**
 * Returns a function which can be used to extract the range of a text fragment
 * from within a parsed language. This function should only return a nominal
 * range for fragments within the document that should be treated like raw text,
 * such as comments strings or error nodes. In these cases we want our
 * surrounding pair algorithm to fall back to a pure raw text-based approach.
 * @param languageId The language for which to get the text fragment extractor
 * for
 * @returns The text fragment extractor for the given language
 */
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
  javascript: constructDefaultTextFragmentExtractor(
    "javascript",
    typescriptStringTextFragmentExtractor
  ),
  javascriptreact: constructDefaultTextFragmentExtractor(
    "javascriptreact",
    typescriptStringTextFragmentExtractor
  ),
  jsonc: constructDefaultTextFragmentExtractor(
    "jsonc",
    jsonStringTextFragmentExtractor
  ),
  json: constructDefaultTextFragmentExtractor(
    "json",
    jsonStringTextFragmentExtractor
  ),
  python: constructDefaultTextFragmentExtractor("python"),
  typescript: constructDefaultTextFragmentExtractor(
    "typescript",
    typescriptStringTextFragmentExtractor
  ),
  typescriptreact: constructDefaultTextFragmentExtractor(
    "typescriptreact",
    typescriptStringTextFragmentExtractor
  ),
};
