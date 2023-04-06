import {
  Position,
  Range,
  Selection,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { intersection } from "lodash";
import { Point, Query, QueryCapture, SyntaxNode, Tree } from "web-tree-sitter";
import { SupportedLanguageId } from "../../../../languages/constants";
import {
  NodeMatcher,
  NodeMatcherValue,
  SelectionExtractor,
  SelectionWithEditor,
} from "../../../../typings/Types";
import {
  makeRangeFromPositions,
  simpleSelectionExtractor,
} from "../../../../util/nodeSelectors";
import queryBasedSpecification from "./queryBasedSpecification";

let query: Query;

/**
 *
 * @param scopeType The scopeType the matcher is responsible for matching.
 * @param isIterationScopePresent Indicates whether iteration scope will be defined via the scm file or derived
 * by looking at the parent.
 * @param scopeQuery The query with node matchers for a specific language.
 * @param selector Unused, discard once legacy matching is removed.
 * @returns A {@link NodeMatcher} object that can be used to for a specific scopeType.
 */
export function defaultMatcher(
  scopeType: string,
  isIterationScopePresent: boolean,
  scopeQuery: string,
  selector: SelectionExtractor = simpleSelectionExtractor,
): NodeMatcher {
  return (
    selection: SelectionWithEditor,
    treeSitterHook: Tree | SyntaxNode,
    siblings: boolean = false,
  ): NodeMatcherValue[] | null => {
    const tree = treeSitterHook as Tree;
    const query = getQuery(tree, scopeQuery);
    const rawCaptures = getCapture(selection, tree.rootNode, query, scopeType);

    if (!rawCaptures || rawCaptures.length === 0) {
      return null;
    }
    const selectedCaptures = selectCaptureByRange(rawCaptures, selection);

    if (!selectedCaptures) {
      return null;
    }

    if (siblings) {
      return generateCapturesIfSiblingsPresent(
        selectedCaptures,
        isIterationScopePresent,
        query,
        scopeType,
        selector,
        selection,
      );
    }

    const leadingNode = selectedCaptures[0].node;
    // TODO: Could we target ES2022 and use .at(-1)?
    const trailingNode = selectedCaptures[selectedCaptures.length - 1].node;
    return [
      {
        // TODO: What should we do here if we are matching multiple nodes for the selection? Which node do we reference?
        node: selectedCaptures[0].node,
        selection: {
          selection: new Selection(
            new Position(
              leadingNode.startPosition.row,
              leadingNode.startPosition.column,
            ),
            new Position(
              trailingNode.endPosition.row,
              trailingNode.endPosition.column,
            ),
          ),
          context: {},
        },
      },
    ];
  };
}

function generateCapturesIfSiblingsPresent(
  selectedCaptures: QueryCapture[],
  isIterationScopePresent: boolean,
  query: Query,
  scopeType: string,
  selector: SelectionExtractor,
  selection: SelectionWithEditor,
) {
  if (selectedCaptures.length > 1) {
    throw new Error(
      "Cannot match siblings on captures which return a range. Try selecitng a single node.",
    );
  } else if (isIterationScopePresent) {
    throw new Error("searchScope based queries are not implemented.");
  }

  const siblingCaptures = findBySiblingsByParent(
    selectedCaptures[0].node,
    query,
    scopeType,
  );

  return siblingCaptures!.map((c) => {
    return {
      node: c.node,
      selection: selector(selection.editor, c.node),
    };
  });
}

/**
 * Accesses the memoized compiled query.
 * @param node Used only to return the tree's language.
 * @param scopeQuery The scm query file for a given language.
 * @returns Query object
 */
function getQuery(tree: Tree, scopeQuery: string): Query {
  if (!query) {
    query = tree.getLanguage().query(scopeQuery);
  }
  return query;
}

/**
 * Prioritize current position of the cursor, one space to the right and then finally one space to the left.
 * @param selection Used to derive start and end points for a selection.
 * @param root Query is run against the root node.
 * @param query Compiled query to run against the parsed tree.
 * @param scopeType The scope type that the matcher is responsible for matching.
 * @returns Captures that match the scope type, possibly an empty list if there are no matches.
 */
function getCapture(
  selection: SelectionWithEditor,
  root: SyntaxNode,
  query: Query,
  scopeType: string,
) {
  const startPoint = generatePointFromSelection(selection, "start");
  const endPoint = generatePointFromSelection(selection, "end");

  const positions = [
    { startPoint, endPoint },
    {
      startPoint,
      endPoint: { row: endPoint.row, column: endPoint.column + 1 },
    },
    {
      startPoint: { row: startPoint.row, column: startPoint.column - 1 },
      endPoint,
    },
  ];

  for (const { startPoint, endPoint } of positions) {
    const matches = query
      .matches(root, startPoint, endPoint)
      .filter(({ captures }) =>
        captures.some((capture) => capture.name === scopeType),
      );

    if (matches && matches.length > 0) {
      return matches;
    }
  }
}

/**
 * This method takes captures for a given range and scopeType, alongside a selection and then returns
 * the relevant captures. If the selection is a single point, only return one capture. If the selection is a
 * range, return a leading and trailing capture. If there is no leading capture, bail early.
 *
 * @param captures The matching nodes for a given scopeType and range.
 * @param selection Used to derive start and end points which are matched against a capture.
 * @returns The capture for a single point or the captures for a start and end point.
 */
function selectCaptureByRange(
  captures: QueryCapture[],
  selection: SelectionWithEditor,
): QueryCapture[] | null {
  const isSinglePoint = selection.selection.isEmpty;

  const leadingCapture = matchCapturesOnPosition(
    captures,
    selection.selection.start,
  );

  if (!leadingCapture) {
    return null;
  }

  if (isSinglePoint) {
    return [leadingCapture];
  } else {
    const trailingCapture = matchCapturesOnPosition(
      captures,
      selection.selection.end,
    );
    if (!trailingCapture) {
      return null;
    }
    return [leadingCapture, trailingCapture];
  }
}

/**
 *
 * @param captures The matching nodes for a given scopeType and range.
 * @param position The position to match against.
 * @returns The capture furthest down the tree which contains the position.
 */
function matchCapturesOnPosition(captures: QueryCapture[], position: Position) {
  let capture;
  for (const c of captures) {
    const captureRange: Range = makeRangeFromPositions(
      c.node.startPosition,
      c.node.endPosition,
    );
    if (captureRange.contains(position)) {
      if (!capture) {
        capture = c;
      } else {
        const leadingCaptureRange = makeRangeFromPositions(
          capture.node.startPosition,
          capture.node.endPosition,
        );
        if (leadingCaptureRange.contains(captureRange)) {
          capture = c;
        }
      }
    }
  }
  return capture;
}

function generatePointFromSelection(
  selection: SelectionWithEditor,
  pointType: "start" | "end",
): Point {
  return {
    row: selection.selection[pointType].line,
    column: selection.selection[pointType].character,
  };
}

/**
 * Ported from legacy parent matching. This code is responsible for finding siblings of nodes which do not have
 * a `searchScope` defined in the language's .scm query file.
 * @param node The matching node from the query and range matching. We will look at this node's parent to find siblings.
 * @param query The compiled query which will be run against the parent node.
 * @param scopeType The scope type that the matcher is responsible for matching.
 * @returns Sibling matches of the node or only the node itself.
 */
function findBySiblingsByParent(
  node: SyntaxNode,
  query: Query,
  scopeType: string,
) {
  let parent: SyntaxNode | null = node.parent;
  const ids = parent?.namedChildren.map((c) => c.id);
  while (parent != null) {
    const matches = query
      .captures(parent)
      .filter(
        (capture) =>
          capture.name === scopeType && ids?.includes(capture.node.id),
      );
    if (matches.length > 0) {
      return matches;
    }
    parent = parent.parent;
  }
  return [];
}

export function getQueryNodeMatcher(
  languageId: string,
  scopeTypeType: SimpleScopeTypeType,
): NodeMatcher | undefined {
  const matchers = queryBasedMatchers[languageId as SupportedLanguageId];

  if (matchers == null) {
    // Note: When all nodes are matched using this method, return notSupported.
    return undefined;
  }

  return matchers[scopeTypeType];
}

const queryBasedMatchers: Partial<
  Record<SupportedLanguageId, Record<SimpleScopeTypeType, NodeMatcher>>
> = {
  ruby: queryBasedSpecification("ruby"),
};

for (const languageId in queryBasedMatchers) {
  const queryBasedMatcher =
    queryBasedMatchers[languageId as SupportedLanguageId];
  if (queryBasedMatcher) {
    ensureUniqueMatchers(
      languageMatchers[languageId as SupportedLanguageId],
      queryBasedMatcher,
      languageId,
    );
  }
}

function ensureUniqueMatchers(
  regexMatcher: Record<SimpleScopeTypeType, NodeMatcher>,
  queryBasedMatchers:
    | Partial<Record<SimpleScopeTypeType, NodeMatcher>>
    | undefined,
  languageName: string,
) {
  const duplicates = intersection(
    Object.keys(regexMatcher),
    Object.keys(queryBasedMatchers),
  );
  if (duplicates.length > 0) {
    throw new Error(
      `ScopeTypes: [${duplicates.join(
        ", ",
      )}] for ${languageName} defined via both Regex and Query code paths. Please remove duplicates`,
    );
  }
}
