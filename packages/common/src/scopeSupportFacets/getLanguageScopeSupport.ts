import { htmlSupport } from "./html";
import { javascriptSupport } from "./javascript";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "javascript":
      return javascriptSupport;
    case "html":
      return htmlSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
