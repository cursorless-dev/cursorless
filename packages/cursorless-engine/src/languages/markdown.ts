import { SimpleScopeTypeType, TextEditor } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { NodeFinder, NodeMatcherAlternative } from "../typings/Types";
import { leadingSiblingNodeFinder, patternFinder } from "../util/nodeFinders";
import { createPatternMatchers, matcher } from "../util/nodeMatchers";
import { extendUntilNextMatchingSiblingOrLast } from "../util/nodeSelectors";
import { shrinkRangeToFitContent } from "../util/selectionUtils";

const HEADING_MARKER_TYPES = [
  "atx_h1_marker",
  "atx_h2_marker",
  "atx_h3_marker",
  "atx_h4_marker",
  "atx_h5_marker",
  "atx_h6_marker",
] as const;
type HeadingMarkerType = (typeof HEADING_MARKER_TYPES)[number];

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

  const { context, selection } = extendUntilNextMatchingSiblingOrLast(
    editor,
    node,
    finder,
  );
  return {
    context,
    selection: shrinkRangeToFitContent(editor, selection).toSelection(
      selection.isReversed,
    ),
  };
}

function sectionMatcher(...patterns: string[]) {
  const finder = patternFinder(...patterns);

  return matcher(leadingSiblingNodeFinder(finder), sectionExtractor);
}

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  section: sectionMatcher("atx_heading"),
  sectionLevelOne: sectionMatcher("atx_heading.atx_h1_marker"),
  sectionLevelTwo: sectionMatcher("atx_heading.atx_h2_marker"),
  sectionLevelThree: sectionMatcher("atx_heading.atx_h3_marker"),
  sectionLevelFour: sectionMatcher("atx_heading.atx_h4_marker"),
  sectionLevelFive: sectionMatcher("atx_heading.atx_h5_marker"),
  sectionLevelSix: sectionMatcher("atx_heading.atx_h6_marker"),
};

export default createPatternMatchers(nodeMatchers);
