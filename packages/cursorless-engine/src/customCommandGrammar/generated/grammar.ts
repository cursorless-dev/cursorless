// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var simpleActionName: any;
declare var bringMove: any;
declare var insertionMode: any;
declare var simpleScopeTypeType: any;
declare var pairedDelimiter: any;
declare var simpleMarkType: any;
declare var placeholderTarget: any;

import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";
import {
  bringMoveActionDescriptor,
  containingScopeModifier,
  partialPrimitiveTargetDescriptor,
  createPlaceholderTarget,
  primitiveDestinationDescriptor,
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
    {"name": "main", "symbols": ["action"], "postprocess": id},
    {"name": "action", "symbols": [(lexer.has("simpleActionName") ? {type: "simpleActionName"} : simpleActionName), "target"], "postprocess": 
        ([simpleActionName, target]) => simpleActionDescriptor(simpleActionName, target)
        },
    {"name": "action", "symbols": [(lexer.has("bringMove") ? {type: "bringMove"} : bringMove), "target", "destination"], "postprocess": 
        ([bringMove, target, destination]) => bringMoveActionDescriptor(bringMove, target, destination)
        },
    {"name": "destination", "symbols": ["primitiveDestination"], "postprocess": id},
    {"name": "destination", "symbols": [(lexer.has("insertionMode") ? {type: "insertionMode"} : insertionMode), "target"], "postprocess": 
        ([insertionMode, target]) => primitiveDestinationDescriptor(insertionMode, target)
        },
    {"name": "target", "symbols": ["primitiveTarget"], "postprocess": id},
    {"name": "primitiveTarget$ebnf$1", "symbols": ["modifier"]},
    {"name": "primitiveTarget$ebnf$1", "symbols": ["primitiveTarget$ebnf$1", "modifier"], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "primitiveTarget", "symbols": ["primitiveTarget$ebnf$1"], "postprocess": 
        ([modifiers]) => partialPrimitiveTargetDescriptor(modifiers, undefined)
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
    {"name": "mark", "symbols": [(lexer.has("placeholderTarget") ? {type: "placeholderTarget"} : placeholderTarget)], "postprocess": 
        ([placeholderTarget]) => createPlaceholderTarget(placeholderTarget)
        }
  ],
  ParserStart: "main",
};

export default grammar;
