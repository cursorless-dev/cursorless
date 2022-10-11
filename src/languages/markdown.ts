import { Selection, TextEditor } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import {
  NodeFinder,
  NodeMatcherAlternative,
  SelectionWithContext,
} from "../typings/Types";
import { SimpleScopeTypeType } from "../typings/targetDescriptor.types";
import { leadingSiblingNodeFinder, patternFinder } from "../util/nodeFinders";
import {
  createPatternMatchers,
  leadingMatcher,
  matcher,
} from "../util/nodeMatchers";
import {
  extendUntilNextMatchingSiblingOrLast,
  getNodeRange,
} from "../util/nodeSelectors";

/**
 * Given a node representing the text of a section heading (without leading
 * marker), will return the content range as the text without the leading
 * whitespace, and the outside range includes the leading marker, so that
 * "chuck name" deletes the heading
 * @param editor The editor containing the node
 * @param node The node to extract from; will be the content of the heading without the leading marker
 * @returns The selection with context
 */
function nameExtractor(
  editor: TextEditor,
  node: SyntaxNode,
): SelectionWithContext {
  const range = getNodeRange(node);
  const contentRange = range.isEmpty
    ? range
    : range.with(range.start.translate(0, 1));
  const removalRange = getNodeRange(node.parent!);

  return {
    selection: new Selection(contentRange.start, contentRange.end),
    context: {
      removalRange,
    },
  };
}

const HEADING_MARKER_TYPES = [
  "atx_h1_marker",
  "atx_h2_marker",
  "atx_h3_marker",
  "atx_h4_marker",
  "atx_h5_marker",
  "atx_h6_marker",
] as const;
type HeadingMarkerType = typeof HEADING_MARKER_TYPES[number];

/**
 * Returns a node finder that will only accept nodes of heading level at least
 * as high as the given heading level type
 * @param headingType The heading type of the node we'll be starting at
 * @returns A node finder that will return the next node that is of the same
 * marker level or higher than the original type
 */
function makeMinimumHeadingLevelFinder(
  headingType: HeadingMarkerType,
): NodeFinder {
  const markerIndex = HEADING_MARKER_TYPES.indexOf(headingType);
  return (node: SyntaxNode) => {
    return node.type === "atx_heading" &&
      HEADING_MARKER_TYPES.indexOf(
        node.firstNamedChild?.type as HeadingMarkerType,
      ) <= markerIndex
      ? node
      : null;
  };
}

function sectionExtractor(editor: TextEditor, node: SyntaxNode) {
  const finder = makeMinimumHeadingLevelFinder(
    node.firstNamedChild?.type as HeadingMarkerType,
  );

  return extendUntilNextMatchingSiblingOrLast(editor, node, finder);
}

function sectionMatcher(...patterns: string[]) {
  const finder = patternFinder(...patterns);

  return matcher(leadingSiblingNodeFinder(finder), sectionExtractor);
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  list: ["loose_list", "tight_list"],
  comment: "html_block",
  name: matcher(
    leadingSiblingNodeFinder(patternFinder("atx_heading.heading_content!")),
    nameExtractor,
  ),
  collectionItem: leadingMatcher(["list_item.paragraph!"], ["list_marker"]),
  section: sectionMatcher("atx_heading"),
  sectionLevelOne: sectionMatcher("atx_heading.atx_h1_marker"),
  sectionLevelTwo: sectionMatcher("atx_heading.atx_h2_marker"),
  sectionLevelThree: sectionMatcher("atx_heading.atx_h3_marker"),
  sectionLevelFour: sectionMatcher("atx_heading.atx_h4_marker"),
  sectionLevelFive: sectionMatcher("atx_heading.atx_h5_marker"),
  sectionLevelSix: sectionMatcher("atx_heading.atx_h6_marker"),
};

export default createPatternMatchers(nodeMatchers);
