import type { Position, TextDocument } from "@cursorless/common";
import { showError } from "@cursorless/common";
import type { Point, Query } from "web-tree-sitter";
import { ide } from "../../singletons/ide.singleton";
import type { TreeSitter } from "../../typings/TreeSitter";
import { getNodeRange } from "../../util/nodeSelectors";
import type {
  MutableQueryMatch,
  QueryCapture,
  QueryMatch,
} from "./QueryCapture";
import { parsePredicates } from "./parsePredicates";
import { predicateToString } from "./predicateToString";
import { groupBy, uniq } from "lodash";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import { rewriteStartOfEndOf } from "./rewriteStartOfEndOf";

/**
 * Wrapper around a tree-sitter query that provides a more convenient API, and
 * defines our own custom predicate operators
 */
export class TreeSitterQuery {
  private constructor(
    private treeSitter: TreeSitter,

    /**
     * The raw tree-sitter query as parsed by tree-sitter from the query file
     */
    private query: Query,

    /**
     * The predicates for each pattern in the query. Each element of the outer
     * array corresponds to a pattern, and each element of the inner array
     * corresponds to a predicate for that pattern.
     */
    private patternPredicates: ((match: MutableQueryMatch) => boolean)[][],
  ) {}

  static create(languageId: string, treeSitter: TreeSitter, query: Query) {
    const { errors, predicates } = parsePredicates(query.predicates);

    if (errors.length > 0) {
      for (const error of errors) {
        const context = [
          `language ${languageId}`,
          `pattern ${error.patternIdx}`,
          `predicate \`${predicateToString(
            query.predicates[error.patternIdx][error.predicateIdx],
          )}\``,
        ].join(", ");

        showError(
          ide().messages,
          "TreeSitterQuery.parsePredicates",
          `Error parsing predicate for ${context}: ${error.error}`,
        );
      }

      // We show errors to the user, but we don't want to crash the extension
      // unless we're in test mode
      if (ide().runMode === "test") {
        throw new Error("Invalid predicates");
      }
    }

    return new TreeSitterQuery(treeSitter, query, predicates);
  }

  matches(
    document: TextDocument,
    start?: Position,
    end?: Position,
  ): QueryMatch[] {
    return this.query
      .matches(
        this.treeSitter.getTree(document).rootNode,
        start == null ? undefined : positionToPoint(start),
        end == null ? undefined : positionToPoint(end),
      )
      .map(
        ({ pattern, captures }): MutableQueryMatch => ({
          patternIdx: pattern,
          captures: captures.map(({ name, node }) => ({
            name,
            node,
            document,
            range: getNodeRange(node),
            insertionDelimiter: undefined,
            allowMultiple: false,
          })),
        }),
      )
      .filter((match) =>
        this.patternPredicates[match.patternIdx].every((predicate) =>
          predicate(match),
        ),
      )
      .map((match): QueryMatch => {
        // Merge the ranges of all captures with the same name into a single
        // range and return one capture with that name.  We consider captures
        // with names `@foo`, `@foo.start`, and `@foo.end` to have the same
        // name, for which we'd return a capture with name `foo`.
        const captures: QueryCapture[] = Object.entries(
          groupBy(match.captures, ({ name }) => normalizeCaptureName(name)),
        ).map(([name, captures]) => {
          captures = rewriteStartOfEndOf(captures);
          const capturesAreValid = checkCaptureStartEnd(
            captures,
            ide().messages,
          );

          if (!capturesAreValid && ide().runMode === "test") {
            throw new Error("Invalid captures");
          }

          return {
            name,
            range: captures
              .map(({ range }) => range)
              .reduce((accumulator, range) => range.union(accumulator)),
            allowMultiple: captures.some((capture) => capture.allowMultiple),
            insertionDelimiter: captures.find(
              (capture) => capture.insertionDelimiter != null,
            )?.insertionDelimiter,
          };
        });

        return { ...match, captures };
      });
  }

  get captureNames() {
    return uniq(this.query.captureNames.map(normalizeCaptureName));
  }
}

function normalizeCaptureName(name: string): string {
  return name.replace(/(\.(start|end))?(\.(startOf|endOf))?$/, "");
}

function positionToPoint(start: Position): Point {
  return { row: start.line, column: start.character };
}
