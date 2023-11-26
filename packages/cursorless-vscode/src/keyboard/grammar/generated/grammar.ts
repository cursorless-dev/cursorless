// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
// Bypasses TS6133. Allow declared but unused functions.
// @ts-ignore
function id(d: any[]): any { return d[0]; }
declare var makeRange: any;
declare var makeList: any;
declare var every: any;
declare var nextPrev: any;
declare var simpleAction: any;
declare var vscodeCommand: any;
declare var simpleScopeTypeType: any;
declare var color: any;
declare var shape: any;
declare var combineColorAndShape: any;
declare var direction: any;
declare var digit: any;

import { capture, command, UNUSED as _ } from "../grammarHelpers"
import { keyboardLexer } from "../keyboardLexer";

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
  Lexer: keyboardLexer,
  ParserRules: [
    {"name": "main", "symbols": ["decoratedMark"], "postprocess": command("targetDecoratedMarkReplace", ["decoratedMark"])},
    {"name": "main", "symbols": [(keyboardLexer.has("makeRange") ? {type: "makeRange"} : makeRange), "decoratedMark"], "postprocess": 
        command("targetDecoratedMarkExtend", [_, "decoratedMark"])
        },
    {"name": "main", "symbols": [(keyboardLexer.has("makeList") ? {type: "makeList"} : makeList), "decoratedMark"], "postprocess": 
        command("targetDecoratedMarkAppend", [_, "decoratedMark"])
        },
    {"name": "main", "symbols": ["scopeType"], "postprocess": command("modifyTargetContainingScope", ["scopeType"])},
    {"name": "main", "symbols": [(keyboardLexer.has("every") ? {type: "every"} : every), "scopeType"], "postprocess": command("targetEveryScopeType", [_, "scopeType"])},
    {"name": "main$ebnf$1", "symbols": ["offset"], "postprocess": id},
    {"name": "main$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "main$ebnf$2", "symbols": ["number"], "postprocess": id},
    {"name": "main$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "main", "symbols": ["main$ebnf$1", (keyboardLexer.has("nextPrev") ? {type: "nextPrev"} : nextPrev), "main$ebnf$2", "scopeType"], "postprocess": 
        command(
          "targetRelativeExclusiveScope",
          ["offset", _, "length", "scopeType"],
        )
        },
    {"name": "main", "symbols": [(keyboardLexer.has("simpleAction") ? {type: "simpleAction"} : simpleAction)], "postprocess": command("performSimpleActionOnTarget", ["actionName"])},
    {"name": "main", "symbols": [(keyboardLexer.has("vscodeCommand") ? {type: "vscodeCommand"} : vscodeCommand)], "postprocess": command("vscodeCommand", ["command"])},
    {"name": "scopeType", "symbols": [(keyboardLexer.has("simpleScopeTypeType") ? {type: "simpleScopeTypeType"} : simpleScopeTypeType)], "postprocess": capture("type")},
    {"name": "decoratedMark", "symbols": [(keyboardLexer.has("color") ? {type: "color"} : color)], "postprocess": capture("color")},
    {"name": "decoratedMark", "symbols": [(keyboardLexer.has("shape") ? {type: "shape"} : shape)], "postprocess": capture("shape")},
    {"name": "decoratedMark", "symbols": [(keyboardLexer.has("combineColorAndShape") ? {type: "combineColorAndShape"} : combineColorAndShape), (keyboardLexer.has("color") ? {type: "color"} : color), (keyboardLexer.has("shape") ? {type: "shape"} : shape)], "postprocess": capture(_, "color", "shape")},
    {"name": "decoratedMark", "symbols": [(keyboardLexer.has("combineColorAndShape") ? {type: "combineColorAndShape"} : combineColorAndShape), (keyboardLexer.has("shape") ? {type: "shape"} : shape), (keyboardLexer.has("color") ? {type: "color"} : color)], "postprocess": capture(_, "shape", "color")},
    {"name": "offset$ebnf$1", "symbols": [(keyboardLexer.has("direction") ? {type: "direction"} : direction)], "postprocess": id},
    {"name": "offset$ebnf$1", "symbols": [], "postprocess": () => null},
    {"name": "offset", "symbols": ["offset$ebnf$1", "number"], "postprocess": capture("direction", "number")},
    {"name": "offset$ebnf$2", "symbols": ["number"], "postprocess": id},
    {"name": "offset$ebnf$2", "symbols": [], "postprocess": () => null},
    {"name": "offset", "symbols": ["offset$ebnf$2", (keyboardLexer.has("direction") ? {type: "direction"} : direction)], "postprocess": capture("number", "direction")},
    {"name": "number$ebnf$1", "symbols": [(keyboardLexer.has("digit") ? {type: "digit"} : digit)]},
    {"name": "number$ebnf$1", "symbols": ["number$ebnf$1", (keyboardLexer.has("digit") ? {type: "digit"} : digit)], "postprocess": (d) => d[0].concat([d[1]])},
    {"name": "number", "symbols": ["number$ebnf$1"], "postprocess": 
        ([digits]) =>
          digits.reduce((total: number, digit: number) => total * 10 + digit, 0)
        }
  ],
  ParserStart: "main",
};

export default grammar;
