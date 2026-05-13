import type * as treeSitter from "web-tree-sitter";
import type {
  IDE,
  Mutable,
  Position,
  TextDocument,
  TreeSitter,
} from "@cursorless/lib-common";
import type { ScopeCaptureName } from "./captureNames";
import {
  getNormalizedCaptureIndex,
  getNormalizedCaptureName,
} from "./captureNames";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import { getNodeRange } from "./getNodeRange";
import { isContainedInErrorNode } from "./isContainedInErrorNode";
import { parsePredicatesWithErrorHandling } from "./parsePredicatesWithErrorHandling";
import { positionToPoint } from "./positionToPoint";
import type {
  MutableQueryCapture,
  PatternPredicate,
  QueryCapture,
  QueryMatch,
} from "./QueryCapture";
import {
  createTestQueryCapture,
  getStartOfEndOfNodeRange,
  getStartOfEndOfRange,
  rewriteStartOfEndOf,
} from "./rewriteStartOfEndOf";
import { treeSitterQueryCache } from "./TreeSitterQueryCache";

/**
 * Wrapper around a tree-sitter query that provides a more convenient API, and
 * defines our own custom predicate operators
 */
export class TreeSitterQuery {
  private shouldCheckCaptures: boolean;

  private constructor(
    private ide: IDE,
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
    this.shouldCheckCaptures = ide.runMode !== "production";
  }

  static create(
    ide: IDE,
    languageId: string,
    treeSitter: TreeSitter,
    query: treeSitter.Query,
  ) {
    const predicates = parsePredicatesWithErrorHandling(ide, languageId, query);

    return new TreeSitterQuery(ide, treeSitter, query, predicates);
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

      // The split path here is to avoid creating query captures if there are no
      // predicates, Solely for performance.
      const captures =
        patternPredicates.length > 0
          ? this.createQueryCapturesWithPredicates(
              document,
              match,
              patternPredicates,
              captureNameFilter,
            )
          : this.createQueryCapturesWithoutPredicates(match, captureNameFilter);

      if (captures.length > 0) {
        results.push({ captures });
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

  private createQueryCapturesWithPredicates(
    document: TextDocument,
    match: treeSitter.QueryMatch,
    predicates: PatternPredicate[],
    captureNameFilter: Set<number> | undefined,
  ): QueryCapture[] {
    const captures: MutableQueryCapture[] = [];

    for (const capture of match.captures) {
      captures.push({
        name: capture.name,
        node: capture.node,
        document,
        range: getNodeRange(capture.node),
        allowMultiple: false,
        insertionDelimiter: undefined,
        hasError: () => isContainedInErrorNode(capture.node),
      });
    }

    for (const predicate of predicates) {
      if (!predicate({ captures })) {
        return [];
      }
    }

    const result: QueryCapture[] = [];
    const map = new Map<
      string,
      { acc: Mutable<QueryCapture>; captures: QueryCapture[] }
    >();

    // Merge the ranges of all captures with the same name into a single
    // range and return one capture with that name.  We consider captures
    // with names `@foo`, `@foo.start`, and `@foo.end` to have the same
    // name, for which we'd return a capture with name `foo`.

    for (const capture of captures) {
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
        const acc: QueryCapture = {
          name,
          range,
          allowMultiple: capture.allowMultiple,
          insertionDelimiter: capture.insertionDelimiter,
          hasError: () => captures.some((c) => c.hasError()),
        };
        result.push(acc);
        map.set(name, { acc, captures });
      } else {
        existing.acc.range = existing.acc.range.union(range);
        existing.acc.allowMultiple ||= capture.allowMultiple;
        existing.acc.insertionDelimiter ??= capture.insertionDelimiter;
        existing.captures.push(capture);
      }
    }

    if (this.shouldCheckCaptures) {
      checkCaptures(this.ide, Array.from(map.values()));
    }

    return result;
  }

  private createQueryCapturesWithoutPredicates(
    match: treeSitter.QueryMatch,
    captureNameFilter: Set<number> | undefined,
  ): QueryCapture[] {
    const result: QueryCapture[] = [];
    const map = new Map<
      string,
      {
        acc: Mutable<QueryCapture>;
        captures: treeSitter.QueryCapture[];
      }
    >();

    for (const capture of match.captures) {
      if (
        captureNameFilter != null &&
        !captureNameFilter.has(getNormalizedCaptureIndex(capture.name))
      ) {
        continue;
      }

      const name = getNormalizedCaptureName(capture.name);
      const range = getStartOfEndOfNodeRange(capture.name, capture.node);
      const existing = map.get(name);

      if (existing == null) {
        const captures = [capture];
        const acc: QueryCapture = {
          name,
          range,
          allowMultiple: false,
          insertionDelimiter: undefined,
          hasError: () => captures.some((c) => isContainedInErrorNode(c.node)),
        };
        result.push(acc);
        map.set(name, { acc, captures });
      } else {
        existing.acc.range = existing.acc.range.union(range);
        existing.captures.push(capture);
      }
    }

    if (this.shouldCheckCaptures) {
      checkCaptures(
        this.ide,
        Array.from(map.values(), (v) => ({
          captures: v.captures.map((c) =>
            createTestQueryCapture(c.name, getNodeRange(c.node)),
          ),
        })),
      );
    }

    return result;
  }
}

function checkCaptures(ide: IDE, matches: { captures: QueryCapture[] }[]) {
  for (const match of matches) {
    const capturesAreValid = checkCaptureStartEnd(
      rewriteStartOfEndOf(match.captures),
      ide.messages,
    );
    if (!capturesAreValid && ide.runMode === "test") {
      throw new Error("Invalid captures");
    }
  }
}
