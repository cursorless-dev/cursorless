import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { pythonScopeSupport } from "./python";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { talonScopeSupport } from "./talon";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "javascript":
      return javascriptScopeSupport;
    case "java":
      return javaScopeSupport;
    case "python":
      return pythonScopeSupport;
    case "html":
      return htmlScopeSupport;
    case "talon":
      return talonScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
