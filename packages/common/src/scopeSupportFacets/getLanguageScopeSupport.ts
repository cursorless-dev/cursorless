import { cScopeSupport } from "./c";
import { clojureScopeSupport } from "./clojure";
import { cppScopeSupport } from "./cpp";
import { csharpScopeSupport } from "./csharp";
import { goScopeSupport } from "./go";
import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { jsonScopeSupport } from "./json";
import { luaScopeSupport } from "./lua";
import { pythonScopeSupport } from "./python";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "c":
      return cScopeSupport;
    case "cpp":
      return cppScopeSupport;
    case "clojure":
      return clojureScopeSupport;
    case "csharp":
      return csharpScopeSupport;
    case "go":
      return goScopeSupport;
    case "html":
      return htmlScopeSupport;
    case "java":
      return javaScopeSupport;
    case "javascript":
      return javascriptScopeSupport;
    case "json":
      return jsonScopeSupport;
    case "lua":
      return luaScopeSupport;
    case "python":
      return pythonScopeSupport;
    case "talon":
      return talonScopeSupport;
    case "typescript":
      return typescriptScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
