// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var simpleScopeTypeType: any;
declare var pairedDelimiter: any;

import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";

interface NearleyToken {
  value: any;
  [key: string]: any;
};

interface NearleyLexer {
  reset: (chunk: any, info: any) => void;
  next: () => NearleyToken | undefined;
  save: () => any;
  formatError: (token: any, message: string) => string;
  has: (tokenType: any) => boolean;
};

interface NearleyRule {
  name: string;
  symbols: NearleySymbol[];
  postprocess?: (d: any[], loc?: number, reject?: {}) => any;
};

type NearleySymbol = string | { literal: any } | { test: (token: any) => boolean };

interface Grammar {
  Lexer: NearleyLexer | undefined;
  ParserRules: NearleyRule[];
  ParserStart: string;
};

const grammar: Grammar = {
  Lexer: lexer,
  ParserRules: [
    {"name": "main", "symbols": ["scopeType"]},
    {"name": "scopeType", "symbols": [(lexer.has("simpleScopeTypeType") ? {type: "simpleScopeTypeType"} : simpleScopeTypeType)], "postprocess": capture("type")},
    {"name": "scopeType", "symbols": [(lexer.has("pairedDelimiter") ? {type: "pairedDelimiter"} : pairedDelimiter)], "postprocess": 
        ([delimiter]) => ({ type: "surroundingPair", delimiter })
        }
  ],
  ParserStart: "main",
};

export default grammar;
