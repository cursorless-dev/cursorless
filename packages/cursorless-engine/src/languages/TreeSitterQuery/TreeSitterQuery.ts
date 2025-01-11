import type { Position, TextDocument } from "@cursorless/common";
import { type TreeSitter } from "@cursorless/common";
import type * as treeSitter from "web-tree-sitter";
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
import { parsePredicatesWithErrorHandling } from "./parsePredicatesWithErrorHandling";
import { positionToPoint } from "./positionToPoint";
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
    const matches = this.getTreeMatches(document, start, end);
    const results: QueryMatch[] = [];

    for (const match of matches) {
      const mutableMatch = this.createMutableQueryMatch(document, match);

      if (!this.runPredicates(mutableMatch)) {
        continue;
      }

      results.push(this.createQueryMatch(mutableMatch));
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

  private runPredicates(match: MutableQueryMatch): boolean {
    for (const predicate of this.patternPredicates[match.patternIdx]) {
      if (!predicate(match)) {
        return false;
      }
    }
    return true;
  }

  private createQueryMatch(match: MutableQueryMatch): QueryMatch {
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
