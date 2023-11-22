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
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
