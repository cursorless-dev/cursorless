import { SyntaxNode } from "web-tree-sitter";
import { SelectionWithEditor } from "../typings/Types";
import { stringTextFragmentExtractor as htmlStringTextFragmentExtractor } from "./html";
import { stringTextFragmentExtractor as jsonStringTextFragmentExtractor } from "./json";
import { stringTextFragmentExtractor as phpStringTextFragmentExtractor } from "./php";
import { stringTextFragmentExtractor as rubyStringTextFragmentExtractor } from "./ruby";
import { stringTextFragmentExtractor as typescriptStringTextFragmentExtractor } from "./typescript";
import { UnsupportedLanguageError } from "../errors";
import { Range } from "vscode";
import { SupportedLanguageId } from "./constants";
import { getNodeInternalRange, getNodeRange } from "../util/nodeSelectors";
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
 * Extracts string text fragments in languages that don't have quotation mark
 * tokens as children of string tokens, but instead include them in the text of
 * the string.
 *
 * This is a hack. Rather than letting the parse tree handle the quotation marks
 * in java, we instead just let the textual surround handle them by letting it
 * see the quotation marks. In other languages we prefer to let the parser
 * handle the quotation marks in case they are more than one character long.
 * @param node The node which might be a string node
 * @param selection The selection from which to expand
 * @returns The range of the string text or null if the node is not a string
 */
function constructHackedStringTextFragmentExtractor(
  languageId: SupportedLanguageId
) {
  const stringNodeMatcher = getNodeMatcher(languageId, "string", false);

  return (node: SyntaxNode, selection: SelectionWithEditor) => {
    if (stringNodeMatcher(selection, node) != null) {
      return getNodeRange(node);
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

// NB: For now when we want use the entire file as a text fragment we just
// return null so that the extractor uses it. In the future we should probably
// make a fragment extractor which just pulls out the whole document itself
type FullDocumentTextFragmentExtractor = null;
const fullDocumentTextFragmentExtractor = null;

const textFragmentExtractors: Record<
  SupportedLanguageId,
  TextFragmentExtractor | FullDocumentTextFragmentExtractor
> = {
  c: constructDefaultTextFragmentExtractor("c"),
  clojure: constructDefaultTextFragmentExtractor(
    "clojure",
    constructHackedStringTextFragmentExtractor("clojure")
  ),
  cpp: constructDefaultTextFragmentExtractor("cpp"),
  csharp: constructDefaultTextFragmentExtractor("csharp"),
  go: constructDefaultTextFragmentExtractor("go"),
  html: constructDefaultTextFragmentExtractor(
    "html",
    htmlStringTextFragmentExtractor
  ),
  java: constructDefaultTextFragmentExtractor(
    "java",
    constructHackedStringTextFragmentExtractor("java")
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
  markdown: fullDocumentTextFragmentExtractor,
  php: constructDefaultTextFragmentExtractor(
    "php",
    phpStringTextFragmentExtractor
  ),
  python: constructDefaultTextFragmentExtractor("python"),
  ruby: constructDefaultTextFragmentExtractor(
    "ruby",
    rubyStringTextFragmentExtractor
  ),
  scala: constructDefaultTextFragmentExtractor(
    "scala",
    constructHackedStringTextFragmentExtractor("scala")
  ),
  typescript: constructDefaultTextFragmentExtractor(
    "typescript",
    typescriptStringTextFragmentExtractor
  ),
  typescriptreact: constructDefaultTextFragmentExtractor(
    "typescriptreact",
    typescriptStringTextFragmentExtractor
  ),
  xml: constructDefaultTextFragmentExtractor(
    "xml",
    htmlStringTextFragmentExtractor
  ),
};
