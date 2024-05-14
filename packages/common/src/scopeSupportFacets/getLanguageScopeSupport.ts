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
import { jsoncScopeSupport } from "./jsonc";
import { latexScopeSupport } from "./latex";
import { luaScopeSupport } from "./lua";
import { markdownScopeSupport } from "./markdown";
import { pythonScopeSupport } from "./python";
import { rubyScopeSupport } from "./ruby";
import { rustScopeSupport } from "./rust";
import { scalaScopeSupport } from "./scala";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { scssScopeSupport } from "./scss";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";
import { typescriptreactScopeSupport } from "./typescriptreact";

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
    case "latex":
      return latexScopeSupport;
    case "markdown":
      return markdownScopeSupport;
    case "javascript":
      return javascriptScopeSupport;
    case "javascriptreact":
      return javascriptScopeSupport;
    case "json":
      return jsonScopeSupport;
    case "jsonc":
      return jsoncScopeSupport;
    case "lua":
      return luaScopeSupport;
    case "python":
      return pythonScopeSupport;
    case "ruby":
      return rubyScopeSupport;
    case "rust":
      return rustScopeSupport;
    case "scala":
      return scalaScopeSupport;
    case "talon":
      return talonScopeSupport;
    case "scss":
      return scssScopeSupport;
    case "typescript":
      return typescriptScopeSupport;
    case "typescriptreact":
      return typescriptreactScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
