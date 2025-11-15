import type { TextDocument } from "@cursorless/common";

export class ScopeHandlerCache {
  private key: string = "";
  private documentVersion: number = -1;
  private documentUri: string = "";
  private documentLanguageId: string = "";
  private matches: any[] = [];

  clear() {
    this.key = "";
    this.documentUri = "";
    this.documentVersion = -1;
    this.documentLanguageId = "";
    this.matches = [];
  }

  isValid(key: string, document: TextDocument) {
    return (
      this.key === key &&
      this.documentVersion === document.version &&
      this.documentUri === document.uri.toString() &&
      this.documentLanguageId === document.languageId
    );
  }

  update(key: string, document: TextDocument, matches: any[]) {
    this.key = key;
    this.documentVersion = document.version;
    this.documentUri = document.uri.toString();
    this.documentLanguageId = document.languageId;
    this.matches = matches;
  }

  get<T>(): T[] {
    return this.matches;
  }
}

export const scopeHandlerCache = new ScopeHandlerCache();
