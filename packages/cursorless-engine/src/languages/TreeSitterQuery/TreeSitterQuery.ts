import type { Position, TextDocument, TreeSitter } from "@cursorless/common";
import type * as treeSitter from "web-tree-sitter";
import { ide } from "../../singletons/ide.singleton";
import {
  PerformanceInterval,
  PerformanceTick,
} from "../../testUtil/Performance";
import {
  getNormalizedCaptureIndex,
  getNormalizedCaptureName,
  type ScopeCaptureName,
} from "./captureNames";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import { getNodeRange } from "./getNodeRange";
import { isContainedInErrorNode } from "./isContainedInErrorNode";
import { parsePredicatesWithErrorHandling } from "./parsePredicatesWithErrorHandling";
import { positionToPoint } from "./positionToPoint";
import type {
  MutableQueryCapture,
  MutableQueryMatch,
  QueryCapture,
  QueryMatch,
} from "./QueryCapture";
import {
  getStartOfEndOfRange,
  rewriteStartOfEndOf,
} from "./rewriteStartOfEndOf";
import { treeSitterQueryCache } from "./TreeSitterQueryCache";
type PatternPredicate = (match: MutableQueryMatch) => boolean;

/**
 * Wrapper around a tree-sitter query that provides a more convenient API, and
 * defines our own custom predicate operators
 */
export class TreeSitterQuery {
  private shouldCheckCaptures: boolean;

  private constructor(
    private treeSitter: TreeSitter,

    /**
     * The raw tree-sitter query as parsed by tree-sitter from the query file
     */
    private query: treeSitter.Query,

    /**
     * The predicates for each pattern in the query. Each element of the outer
     * array corresponds to a pattern, and each element of the inner array
     * corresponds to a predicate for that pattern.
     */
    private patternPredicates: PatternPredicate[][],
  ) {
    this.shouldCheckCaptures = ide().runMode !== "production";
  }

  static create(
    languageId: string,
    treeSitter: TreeSitter,
    query: treeSitter.Query,
  ) {
    const predicates = parsePredicatesWithErrorHandling(languageId, query);

    return new TreeSitterQuery(treeSitter, query, predicates);
  }

  hasCapture(name: string): boolean {
    return this.query.captureNames.some(
      (n) => getNormalizedCaptureName(n) === name,
    );
  }

  matches(
    document: TextDocument,
    start: Position,
    end: Position,
  ): QueryMatch[] {
    return this.getMatches(document, start, end, undefined);
  }

  matchesForScopeTypes(
    document: TextDocument,
    scopeTypes: readonly ScopeCaptureName[],
  ): QueryMatch[] {
    const captureNameFilter = new Set(
      scopeTypes.map(getNormalizedCaptureIndex),
    );
    return this.getMatches(document, undefined, undefined, captureNameFilter);
  }

  private getMatches(
    document: TextDocument,
    start: Position | undefined,
    end: Position | undefined,
    captureNameFilter: Set<number> | undefined,
  ): QueryMatch[] {
    if (
      !treeSitterQueryCache.isValid(document, start, end, captureNameFilter)
    ) {
      const matches = this.calculateMatches(
        document,
        start,
        end,
        captureNameFilter,
      );
      treeSitterQueryCache.update(
        document,
        start,
        end,
        captureNameFilter,
        matches,
      );
    }
    return treeSitterQueryCache.get();
  }

  private calculateMatches(
    document: TextDocument,
    start: Position | undefined,
    end: Position | undefined,
    captureNameFilter: Set<number> | undefined,
  ): QueryMatch[] {
    const matches = this.getTreeMatches(document, start, end);
    const results: QueryMatch[] = [];

    for (const match of matches) {
      if (
        captureNameFilter != null &&
        !match.captures.some((capture) =>
          captureNameFilter.has(getNormalizedCaptureIndex(capture.name)),
        )
      ) {
        continue;
      }

      const patternPredicates = this.patternPredicates[match.patternIndex];

      let queryMatch: QueryMatch | undefined;

      if (patternPredicates.length > 0) {
        queryMatch = this.createQueryMatchWithPredicates(
          document,
          match,
          patternPredicates,
          captureNameFilter,
        );
      } else {
        queryMatch = this.createQueryMatchWithoutPredicates(
          match,
          captureNameFilter,
        );
      }

      //   const queryMatch = hasPatternPredicates
      //     ? this.createQueryMatchWithPredicates(
      //         document,
      //         match,
      //         captureNameFilter,
      //       )
      //     : this.createQueryMatchWithoutPredicates(match, captureNameFilter);

      if (queryMatch != null) {
        results.push(queryMatch);
      }
    }

    return results;
  }

  private getTreeMatches(
    document: TextDocument,
    start: Position | undefined,
    end: Position | undefined,
  ) {
    const { rootNode } = this.treeSitter.getTree(document);
    return this.query.matches(rootNode, {
      startPosition: start != null ? positionToPoint(start) : undefined,
      endPosition: end != null ? positionToPoint(end) : undefined,
    });
  }

  private createQueryMatchWithPredicates(
    document: TextDocument,
    match: treeSitter.QueryMatch,
    predicates: PatternPredicate[],
    captureNameFilter: Set<number> | undefined,
  ): QueryMatch | undefined {
    const captures: MutableQueryCapture[] = [];

    for (const { name, node } of match.captures) {
      captures.push({
        name,
        node,
        document,
        range: getNodeRange(node),
        insertionDelimiter: undefined,
        allowMultiple: false,
        hasError: () => isContainedInErrorNode(node),
      });
    }

    const mutableMatch: MutableQueryMatch = { captures };

    for (const predicate of predicates) {
      if (!predicate(mutableMatch)) {
        return undefined;
      }
    }

    return this.createQueryMatch(mutableMatch.captures, captureNameFilter);
  }
  }

  private createQueryMatch(
    match: MutableQueryMatch,
    captureNameFilter: Set<number> | undefined,
  ): QueryMatch | undefined {
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
      if (
        captureNameFilter != null &&
        !captureNameFilter.has(getNormalizedCaptureIndex(capture.name))
      ) {
        continue;
      }
      const name = getNormalizedCaptureName(capture.name);
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

    if (result.length === 0) {
      return undefined;
    }

    if (this.shouldCheckCaptures) {
      this.checkCaptures(Array.from(map.values()));
    }

    return { captures: result };
  }

  private checkCaptures(matches: { captures: MutableQueryCapture[] }[]) {
    for (const match of matches) {
      const capturesAreValid = checkCaptureStartEnd(
        rewriteStartOfEndOf(match.captures),
        ide().messages,
      );
      if (!capturesAreValid && ide().runMode === "test") {
        throw new Error("Invalid captures");
      }
    }
  }
}
