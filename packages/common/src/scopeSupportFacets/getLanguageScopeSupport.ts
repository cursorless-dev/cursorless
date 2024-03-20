import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { jsonScopeSupport } from "./json";
import { pythonScopeSupport } from "./python";
import { luaScopeSupport } from "./lua";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";
import { shellscriptScopeSupport } from "./shellscript";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "html":
      return htmlScopeSupport;
    case "java":
      return javaScopeSupport;
    case "javascript":
      return javascriptScopeSupport;
    case "json":
      return jsonScopeSupport
    case "lua":
      return luaScopeSupport;
    case "python":
      return pythonScopeSupport;
    case "shellscript":
      return shellscriptScopeSupport;
    case "talon":
      return talonScopeSupport;
    case "typescript":
      return typescriptScopeSupport;

  }
  throw Error(`Unsupported language: '${languageId}'`);
}
