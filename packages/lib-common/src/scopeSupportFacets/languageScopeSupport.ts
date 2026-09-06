import type { LanguageId } from "../references/languageReferences";
import { cScopeSupport } from "./c";
import { clojureScopeSupport } from "./clojure";
import { cppScopeSupport } from "./cpp";
import { csharpScopeSupport } from "./csharp";
import { cssScopeSupport } from "./css";
import { dartScopeSupport } from "./dart";
import { goScopeSupport } from "./go";
import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { javascriptreactScopeSupport } from "./javascriptreact";
import { jsonScopeSupport } from "./json";
import { jsoncScopeSupport } from "./jsonc";
import { jsonlScopeSupport } from "./jsonl";
import { kotlinScopeSupport } from "./kotlin";
import { latexScopeSupport } from "./latex";
import { luaScopeSupport } from "./lua";
import { markdownScopeSupport } from "./markdown";
import { phpScopeSupport } from "./php";
import { propertiesScopeSupport } from "./properties";
import { pythonScopeSupport } from "./python";
import { rScopeSupport } from "./r";
import { rubyScopeSupport } from "./ruby";
import { rustScopeSupport } from "./rust";
import { scalaScopeSupport } from "./scala";
import { scmScopeSupport } from "./scm";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { scssScopeSupport } from "./scss";
import { talonScopeSupport } from "./talon";
import { talonListScopeSupport } from "./talonList";
import { typescriptScopeSupport } from "./typescript";
import { typescriptreactScopeSupport } from "./typescriptreact";
import { xmlScopeSupport } from "./xml";
import { yamlScopeSupport } from "./yaml";

export type LanguageScopeSupportId = Exclude<LanguageId, "plaintext">;

export const languageScopeSupport: Record<
  LanguageScopeSupportId,
  LanguageScopeSupportFacetMap
> = {
  c: cScopeSupport,
  clojure: clojureScopeSupport,
  cpp: cppScopeSupport,
  csharp: csharpScopeSupport,
  css: cssScopeSupport,
  dart: dartScopeSupport,
  go: goScopeSupport,
  html: htmlScopeSupport,
  java: javaScopeSupport,
  // java-properties - handled by properties
  javascript: javascriptScopeSupport,
  javascriptreact: javascriptreactScopeSupport,
  json: jsonScopeSupport,
  jsonc: jsoncScopeSupport,
  jsonl: jsonlScopeSupport,
  kotlin: kotlinScopeSupport,
  latex: latexScopeSupport,
  lua: luaScopeSupport,
  markdown: markdownScopeSupport,
  php: phpScopeSupport,
  properties: propertiesScopeSupport,
  python: pythonScopeSupport,
  r: rScopeSupport,
  ruby: rubyScopeSupport,
  rust: rustScopeSupport,
  scala: scalaScopeSupport,
  scm: scmScopeSupport,
  scss: scssScopeSupport,
  "talon-list": talonListScopeSupport,
  talon: talonScopeSupport,
  typescript: typescriptScopeSupport,
  typescriptreact: typescriptreactScopeSupport,
  xml: xmlScopeSupport,
  yaml: yamlScopeSupport,
};

export function isScopeSupportLanguageId(
  value: string,
): value is LanguageScopeSupportId {
  return Object.hasOwn(languageScopeSupport, value);
}

export function getScopeSupportLanguageId(
  value: string,
): LanguageScopeSupportId {
  if (isScopeSupportLanguageId(value)) {
    return value;
  }
  throw new Error(`Unsupported language id: ${value}`);
}
