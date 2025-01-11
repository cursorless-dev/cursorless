import type { Position, TextDocument } from "@cursorless/common";
import type { QueryMatch } from "./QueryCapture";

export class Cache {
  private documentVersion: number = -1;
  private documentUri: string = "";
  private documentLanguageId: string = "";
  private startPosition: Position | undefined;
  private endPosition: Position | undefined;
  private matches: QueryMatch[] = [];

  clear() {
    this.documentUri = "";
    this.documentVersion = -1;
    this.documentLanguageId = "";
    this.startPosition = undefined;
    this.endPosition = undefined;
    this.matches = [];
  }

  isValid(
    document: TextDocument,
    startPosition: Position | undefined,
    endPosition: Position | undefined,
  ) {
    return (
      this.documentVersion === document.version &&
      this.documentUri === document.uri.toString() &&
      this.documentLanguageId === document.languageId &&
      positionsEqual(this.startPosition, startPosition) &&
      positionsEqual(this.endPosition, endPosition)
    );
  }

  update(
    document: TextDocument,
    startPosition: Position | undefined,
    endPosition: Position | undefined,
    matches: QueryMatch[],
  ) {
    this.documentVersion = document.version;
    this.documentUri = document.uri.toString();
    this.documentLanguageId = document.languageId;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
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

export const treeSitterQueryCache = new Cache();
