import type { Position, TextDocument, TreeSitter } from "@cursorless/common";
import type * as treeSitter from "web-tree-sitter";
import { ide } from "../../singletons/ide.singleton";
import { getNormalizedCaptureName } from "./captureNames";
import { checkCaptureStartEnd } from "./checkCaptureStartEnd";
import { getNodeRange } from "./getNodeRange";
import { isContainedInErrorNode } from "./isContainedInErrorNode";
import { parsePredicatesWithErrorHandling } from "./parsePredicatesWithErrorHandling";
import { positionToPoint } from "./positionToPoint";
import type {
  MutableQueryCapture,
  MutableQueryMatch,
  QueryMatch,
} from "./QueryCapture";
import {
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
    private patternPredicates: ((match: MutableQueryMatch) => boolean)[][],
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
    start?: Position,
    end?: Position,
  ): QueryMatch[] {
    if (!treeSitterQueryCache.isValid(document, start, end)) {
      const matches = this.getAllMatches(document, start, end);
      treeSitterQueryCache.update(document, start, end, matches);
    }
    return treeSitterQueryCache.get();
  }

  matchesForCaptures(
    document: TextDocument,
    captureNames: Set<string>,
  ): QueryMatch[] {
    return this.getAllMatches(document, undefined, undefined, captureNames);
  }

  private getAllMatches(
    document: TextDocument,
    start?: Position,
    end?: Position,
    captureNameFilter?: Set<string>,
  ): QueryMatch[] {
    const matches = this.getTreeMatches(document, start, end);
    const results: QueryMatch[] = [];

    for (const match of matches) {
      if (
        captureNameFilter != null &&
        !match.captures.some((capture) =>
          captureNameFilter.has(getNormalizedCaptureName(capture.name)),
        )
      ) {
        continue;
      }

      const hasPatternPredicates =
        this.patternPredicates[match.patternIndex].length > 0;

      const mutableMatch = this.createMutableQueryMatch(
        document,
        match,
        // If there are pattern predicates, we need to include all captures when
        // creating the mutable match, since the predicates may depend on any of
        // the captures.
        captureNameFilter != null && !hasPatternPredicates
          ? captureNameFilter
          : undefined,
      );

      if (!this.runPredicates(mutableMatch)) {
        continue;
      }

      const queryMatch = this.createQueryMatch(mutableMatch, captureNameFilter);

      if (queryMatch != null) {
        results.push(queryMatch);
      }
    }

    return results;
  }

  private getTreeMatches(
    document: TextDocument,
    start?: Position,
    end?: Position,
  ) {
    const { rootNode } = this.treeSitter.getTree(document);
    return this.query.matches(rootNode, {
      startPosition: start != null ? positionToPoint(start) : undefined,
      endPosition: end != null ? positionToPoint(end) : undefined,
    });
  }

  private createMutableQueryMatch(
    document: TextDocument,
    match: treeSitter.QueryMatch,
    captureNameFilter?: Set<string>,
  ): MutableQueryMatch {
    const captures: MutableQueryCapture[] = [];

    for (const { name, node } of match.captures) {
      if (
        captureNameFilter != null &&
        !captureNameFilter.has(getNormalizedCaptureName(name))
      ) {
        continue;
      }

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

    return {
      patternIdx: match.patternIndex,
      captures,
    };
  }

  private runPredicates(match: MutableQueryMatch): boolean {
    for (const predicate of this.patternPredicates[match.patternIdx]) {
      if (!predicate(match)) {
        return false;
      }
    }
    return true;
  }

  private createQueryMatch(
    match: MutableQueryMatch,
    captureNameFilter?: Set<string>,
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
      const name = getNormalizedCaptureName(capture.name);
      if (captureNameFilter != null && !captureNameFilter.has(name)) {
        continue;
      }
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
