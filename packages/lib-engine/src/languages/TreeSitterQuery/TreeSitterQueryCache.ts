import type { Position, TextDocument } from "@cursorless/lib-common";
import type { QueryMatch } from "./QueryCapture";
import { setIsEqual } from "../../util/setIsEqual";

export class TreeSitterQueryCache {
  private documentVersion: number = -1;
  private documentUri: string = "";
  private documentLanguageId: string = "";
  private startPosition: Position | undefined;
  private endPosition: Position | undefined;
  private matches: QueryMatch[] = [];
  private captureNames: Set<number> | undefined;

  clear() {
    this.documentUri = "";
    this.documentVersion = -1;
    this.documentLanguageId = "";
    this.startPosition = undefined;
    this.endPosition = undefined;
    this.captureNames = undefined;
    this.matches = [];
  }

  isValid(
    document: TextDocument,
    startPosition: Position | undefined,
    endPosition: Position | undefined,
    captureNames: Set<number> | undefined,
  ) {
    return (
      this.documentVersion === document.version &&
      this.documentUri === document.uri.toString() &&
      this.documentLanguageId === document.languageId &&
      positionsEqual(this.startPosition, startPosition) &&
      positionsEqual(this.endPosition, endPosition) &&
      setIsEqual(this.captureNames, captureNames)
    );
  }

  update(
    document: TextDocument,
    startPosition: Position | undefined,
    endPosition: Position | undefined,
    captureNames: Set<number> | undefined,
    matches: QueryMatch[],
  ) {
    this.documentVersion = document.version;
    this.documentUri = document.uri.toString();
    this.documentLanguageId = document.languageId;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.captureNames = captureNames;
    this.matches = matches;
  }

  get(): QueryMatch[] {
    return this.matches;
  }
}

function positionsEqual(a: Position | undefined, b: Position | undefined) {
  if (a == null || b == null) {
    return a === b;
  }
  return a.isEqual(b);
}

export const treeSitterQueryCache = new TreeSitterQueryCache();
