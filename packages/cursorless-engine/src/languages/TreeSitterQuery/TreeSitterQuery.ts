import type { Position, TextDocument } from "@cursorless/common";
import { showError, type TreeSitter } from "@cursorless/common";
import type Parser from "web-tree-sitter";
import { ide } from "../../singletons/ide.singleton";
import { getNodeRange } from "../../util/nodeSelectors";
import type {
  MutableQueryCapture,
  MutableQueryMatch,
  QueryMatch,
} from "./QueryCapture";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import { isContainedInErrorNode } from "./isContainedInErrorNode";
import { normalizeCaptureName } from "./normalizeCaptureName";
import { parsePredicates } from "./parsePredicates";
import { positionToPoint } from "./positionToPoint";
import { predicateToString } from "./predicateToString";
import {
  getStartOfEndOfRange,
  rewriteStartOfEndOf,
} from "./rewriteStartOfEndOf";
import { treeSitterQueryCache } from "./treeSitterQueryCache";

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
    private query: Parser.Query,

    /**
     * The predicates for each pattern in the query. Each element of the outer
     * array corresponds to a pattern, and each element of the inner array
     * corresponds to a predicate for that pattern.
     */
    private patternPredicates: ((match: MutableQueryMatch) => boolean)[][],
  ) {}

  static create(
    languageId: string,
    treeSitter: TreeSitter,
    query: Parser.Query,
  ) {
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

        void showError(
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

  hasCapture(name: string): boolean {
    return this.query.captureNames.some(
      (n) => normalizeCaptureName(n) === name,
    );
  }

  matches(
    document: TextDocument,
    start?: Position,
    end?: Position,
  ): QueryMatch[] {
    if (!treeSitterQueryCache.isValid(document, start, end)) {
      const matches = this.getAllMatches(document, start, end);
      treeSitterQueryCache.update(document, start, end, matches);
    }
    return treeSitterQueryCache.get();
  }

  private getAllMatches(
    document: TextDocument,
    start?: Position,
    end?: Position,
  ): QueryMatch[] {
    const checkCaptures = ide().runMode !== "production";
    const results: QueryMatch[] = [];

    const matches = this.query.matches(
      this.treeSitter.getTree(document).rootNode,
      {
        startPosition: start != null ? positionToPoint(start) : undefined,
        endPosition: end != null ? positionToPoint(end) : undefined,
      },
    );

    for (const match of matches) {
      const mutableMatch = createMutableQueryMatch(document, match);

      if (this.runPredicates(mutableMatch)) {
        results.push(createQueryMatch(mutableMatch, checkCaptures));
      }
    }

    return results;
  }

  private runPredicates(match: MutableQueryMatch): boolean {
    for (const predicate of this.patternPredicates[match.patternIdx]) {
      if (!predicate(match)) {
        return false;
      }
    }
    return true;
  }
}

function createMutableQueryMatch(
  document: TextDocument,
  match: Parser.QueryMatch,
): MutableQueryMatch {
  return {
    patternIdx: match.pattern,
    captures: match.captures.map(({ name, node }) => ({
      name,
      node,
      document,
      range: getNodeRange(node),
      insertionDelimiter: undefined,
      allowMultiple: false,
      hasError: () => isContainedInErrorNode(node),
    })),
  };
}

function createQueryMatch(
  match: MutableQueryMatch,
  checkCaptures: boolean,
): QueryMatch {
  const result: MutableQueryCapture[] = [];
  const map = new Map<
    string,
    { acc: MutableQueryCapture; captures: MutableQueryCapture[] }
  >();

  // Merge the ranges of all captures with the same name into a single
  // range and return one capture with that name.  We consider captures
  // with names `@foo`, `@foo.start`, and `@foo.end` to have the same
  // name, for which we'd return a capture with name `foo`.

  for (const capture of match.captures) {
    const name = normalizeCaptureName(capture.name);
    const range = getStartOfEndOfRange(capture);
    const existing = map.get(name);

    if (existing == null) {
      const captures = [capture];
      const acc = {
        ...capture,
        name,
        range,
        hasError: () => captures.some((c) => c.hasError()),
      };
      result.push(acc);
      map.set(name, { acc, captures });
    } else {
      existing.acc.range = existing.acc.range.union(range);
      existing.acc.allowMultiple =
        existing.acc.allowMultiple || capture.allowMultiple;
      existing.acc.insertionDelimiter =
        existing.acc.insertionDelimiter ?? capture.insertionDelimiter;
      existing.captures.push(capture);
    }
  }

  if (checkCaptures) {
    for (const captureGroup of map.values()) {
      const capturesAreValid = checkCaptureStartEnd(
        rewriteStartOfEndOf(captureGroup.captures),
        ide().messages,
      );
      if (!capturesAreValid && ide().runMode === "test") {
        throw new Error("Invalid captures");
      }
    }
  }

  return { captures: result };
}
