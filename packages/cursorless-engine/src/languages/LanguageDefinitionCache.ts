import type {
  SimpleScopeTypeType,
  StringRecord,
  TextDocument,
} from "@cursorless/common";
import type { QueryCapture } from "./TreeSitterQuery/QueryCapture";
import { ide } from "..";

export class LanguageDefinitionCache {
  private languageId: string = "";
  private documentUri: string = "";
  private documentVersion: number = -1;
  private captures: StringRecord<QueryCapture[]> = {};

  isValid(document: TextDocument) {
    if (ide().runMode === "test") {
      return false;
    }
    return (
      this.languageId === document.languageId &&
      this.documentUri === document.uri.toString() &&
      this.documentVersion === document.version
    );
  }

  update(document: TextDocument, captures: StringRecord<QueryCapture[]>) {
    this.languageId = document.languageId;
    this.documentUri = document.uri.toString();
    this.documentVersion = document.version;
    this.captures = captures;
  }

  get(captureName: SimpleScopeTypeType): QueryCapture[] {
    return this.captures[captureName] ?? [];
  }
}
