import type { StringRecord } from "../types/StringRecord";
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
import { talonListScopeSupport } from "./talon-list";
import { typescriptScopeSupport } from "./typescript";
import { typescriptreactScopeSupport } from "./typescriptreact";
import { xmlScopeSupport } from "./xml";
import { yamlScopeSupport } from "./yaml";
import { zigScopeSupport } from "./zig";

/* eslint-disable @typescript-eslint/naming-convention */

export const languageScopeSupport: StringRecord<LanguageScopeSupportFacetMap> =
  {
    "talon-list": talonListScopeSupport,
    c: cScopeSupport,
    clojure: clojureScopeSupport,
    cpp: cppScopeSupport,
    csharp: csharpScopeSupport,
    css: cssScopeSupport,
    dart: dartScopeSupport,
    go: goScopeSupport,
    html: htmlScopeSupport,
    java: javaScopeSupport,
    javascript: javascriptScopeSupport,
    javascriptreact: javascriptreactScopeSupport,
    json: jsonScopeSupport,
    jsonc: jsoncScopeSupport,
    jsonl: jsonlScopeSupport,
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
    talon: talonScopeSupport,
    typescript: typescriptScopeSupport,
    typescriptreact: typescriptreactScopeSupport,
    xml: xmlScopeSupport,
    yaml: yamlScopeSupport,
    zig: zigScopeSupport,
  };
