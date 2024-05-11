import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { jsonScopeSupport } from "./json";
import { pythonScopeSupport } from "./python";
import { csharpScopeSupport } from "./csharp";
import { luaScopeSupport } from "./lua";
import { gleamScopeSupport } from "./gleam";
import { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";

export function getLanguageScopeSupport(
  languageId: string,
): LanguageScopeSupportFacetMap {
  switch (languageId) {
    case "csharp":
      return csharpScopeSupport;
    case "html":
      return htmlScopeSupport;
    case "java":
      return javaScopeSupport;
    case "javascript":
      return javascriptScopeSupport;
    case "json":
      return jsonScopeSupport;
    case "python":
      return pythonScopeSupport;
    case "talon":
      return talonScopeSupport;
    case "typescript":
      return typescriptScopeSupport;
    case "lua":
      return luaScopeSupport;
    case "gleam":
      return gleamScopeSupport;
  }
  throw Error(`Unsupported language: '${languageId}'`);
}
