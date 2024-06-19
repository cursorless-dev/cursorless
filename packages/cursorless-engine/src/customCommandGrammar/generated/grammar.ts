// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var simpleActionName: any;
declare var simpleScopeTypeType: any;
declare var pairedDelimiter: any;
declare var simpleMarkType: any;
declare var placeholderMark: any;

import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";
import {
  containingScopeModifier,
  partialPrimitiveTargetDescriptor,
  createPlaceholderMark,
  simpleActionDescriptor,
  simplePartialMark,
  simpleScopeType,
  surroundingPairScopeType,
} from "../grammarUtil";

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
    {"name": "main", "symbols": ["action"], "postprocess": 
        ([action]) => action
        },
    {"name": "action", "symbols": [(lexer.has("simpleActionName") ? {type: "simpleActionName"} : simpleActionName), "target"], "postprocess": 
        ([simpleActionName, target]) => simpleActionDescriptor(simpleActionName, target)
        },
    {"name": "target", "symbols": ["primitiveTarget"], "postprocess": 
        ([primitiveTarget]) => primitiveTarget
        },
    {"name": "primitiveTarget$ebnf$1", "symbols": ["modifier"]},
    {"name": "primitiveTarget$ebnf$1", "symbols": ["primitiveTarget$ebnf$1", "modifier"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primitiveTarget", "symbols": ["primitiveTarget$ebnf$1"], "postprocess": 
        ([modifiers]) => partialPrimitiveTargetDescriptor(modifiers)
        },
    {"name": "primitiveTarget", "symbols": ["mark"], "postprocess": 
        ([mark]) => partialPrimitiveTargetDescriptor(undefined, mark)
        },
    {"name": "primitiveTarget$ebnf$2", "symbols": ["modifier"]},
    {"name": "primitiveTarget$ebnf$2", "symbols": ["primitiveTarget$ebnf$2", "modifier"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primitiveTarget", "symbols": ["primitiveTarget$ebnf$2", "mark"], "postprocess": 
        ([modifiers, mark]) => partialPrimitiveTargetDescriptor(modifiers, mark)
        },
    {"name": "modifier", "symbols": ["containingScopeModifier"], "postprocess": 
        ([containingScopeModifier]) => containingScopeModifier
        },
    {"name": "containingScopeModifier", "symbols": ["scopeType"], "postprocess": 
        ([scopeType]) => containingScopeModifier(scopeType)
        },
    {"name": "scopeType", "symbols": [(lexer.has("simpleScopeTypeType") ? {type: "simpleScopeTypeType"} : simpleScopeTypeType)], "postprocess": 
        ([simpleScopeTypeType]) => simpleScopeType(simpleScopeTypeType)
        },
    {"name": "scopeType", "symbols": [(lexer.has("pairedDelimiter") ? {type: "pairedDelimiter"} : pairedDelimiter)], "postprocess": 
        ([delimiter]) => surroundingPairScopeType(delimiter)
        },
    {"name": "mark", "symbols": [(lexer.has("simpleMarkType") ? {type: "simpleMarkType"} : simpleMarkType)], "postprocess": 
        ([simpleMarkType]) => simplePartialMark(simpleMarkType)
        },
    {"name": "mark", "symbols": [(lexer.has("placeholderMark") ? {type: "placeholderMark"} : placeholderMark)], "postprocess": 
        ([placeholderMark]) => createPlaceholderMark(placeholderMark)
        }
  ],
  ParserStart: "main",
};

export default grammar;
