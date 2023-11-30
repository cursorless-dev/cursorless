import { htmlSupport } from "./html";
import { javascriptSupport } from "./javascript";
import { plaintextSupport } from "./plaintext";
import {
  LanguageScopeSupportFacetMap,
  TextualLanguageScopeSupportFacetMap,
} from "./scopeSupportFacets";

export function getLanguageScopeSupport(
  languageId: string,
): TextualLanguageScopeSupportFacetMap | LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "plaintext":
      return plaintextSupport;
    case "javascript":
      return javascriptSupport;
    case "html":
      return htmlSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
