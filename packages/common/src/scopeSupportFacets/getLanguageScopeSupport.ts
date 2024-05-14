import { cScopeSupport } from "./c";
import { clojureScopeSupport } from "./clojure";
import { cppScopeSupport } from "./cpp";
import { csharpScopeSupport } from "./csharp";
import { cssScopeSupport } from "./css";
import { goScopeSupport } from "./go";
import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { jsonScopeSupport } from "./json";
import { luaScopeSupport } from "./lua";
import { pythonScopeSupport } from "./python";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { scssScopeSupport } from "./scss";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "c":
      return cScopeSupport;
    case "clojure":
      return clojureScopeSupport;
    case "cpp":
      return cppScopeSupport;
    case "csharp":
      return csharpScopeSupport;
    case "css":
      return cssScopeSupport;
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
    case "scss":
      return scssScopeSupport;
    case "typescript":
      return typescriptScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
