import type { Position, TextDocument } from "@cursorless/common";
import type { QueryMatch } from "./QueryCapture";

export class Cache {
  private documentUri: string = "";
  private documentVersion: number = -1;
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
      this.documentUri === document.uri.toString() &&
      this.documentVersion === document.version &&
      this.documentLanguageId === document.languageId &&
      this.startPosition === startPosition &&
      this.endPosition === endPosition
    );
  }

  update(
    document: TextDocument,
    startPosition: Position | undefined,
    endPosition: Position | undefined,
    matches: QueryMatch[],
  ) {
    this.documentUri = document.uri.toString();
    this.documentVersion = document.version;
    this.documentLanguageId = document.languageId;
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.matches = matches;
  }

  get(): QueryMatch[] {
    return this.matches;
  }
}

export const treeSitterQueryCache = new Cache();
