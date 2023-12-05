import { htmlScopeSupport } from "./html";
import { javascriptScopeSupport } from "./javascript";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "javascript":
      return javascriptScopeSupport;
    case "html":
      return htmlScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
