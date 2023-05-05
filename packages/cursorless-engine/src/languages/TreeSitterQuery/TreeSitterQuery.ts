import {
  Position,
  SilentError,
  TextDocument,
  showError,
} from "@cursorless/common";
import { Point, Query, QueryMatch } from "web-tree-sitter";
import { ide } from "../../singletons/ide.singleton";
import { TreeSitter } from "../../typings/TreeSitter";
import { parsePredicates } from "./parsePredicates";
import { predicateToString } from "./predicateToString";

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
    private patternPredicates: ((match: QueryMatch) => boolean)[][],
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

      // We manually show error messages above, so we don't want the Cursorless
      // default error message to show
      throw new SilentError("Invalid predicates");
    }

    return new TreeSitterQuery(treeSitter, query, predicates);
  }

  matches(document: TextDocument, start: Position, end: Position) {
    return this.query
      .matches(
        this.treeSitter.getTree(document).rootNode,
        positionToPoint(start),
        positionToPoint(end),
      )
      .filter((rawMatch) =>
        this.patternPredicates[rawMatch.pattern].every((predicate) =>
          predicate(rawMatch),
        ),
      );
  }

  get captureNames() {
    return this.query.captureNames;
  }
}

function positionToPoint(start: Position): Point {
  return { row: start.line, column: start.character };
}
