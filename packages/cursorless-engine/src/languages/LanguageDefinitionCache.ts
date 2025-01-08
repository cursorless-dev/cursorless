import type {
  SimpleScopeTypeType,
  StringRecord,
  TextDocument,
} from "@cursorless/common";
import type { QueryCapture } from "./TreeSitterQuery/QueryCapture";

export class LanguageDefinitionCache {
  private documentUri: string = "";
  private documentVersion: number = -1;
  private captures: StringRecord<QueryCapture[]> = {};

  isValid(document: TextDocument) {
    return (
      this.documentUri === document.uri.toString() &&
      this.documentVersion === document.version
    );
  }

  update(document: TextDocument, captures: StringRecord<QueryCapture[]>) {
    this.documentUri = document.uri.toString();
    this.documentVersion = document.version;
    this.captures = captures;
  }

  get(captureName: SimpleScopeTypeType): QueryCapture[] {
    return this.captures[captureName] ?? [];
  }
}
