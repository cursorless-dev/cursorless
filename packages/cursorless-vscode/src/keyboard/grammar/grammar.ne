@preprocessor typescript
@{%
import { capture, command, UNUSED as _ } from "../grammarHelpers"
import { keyboardLexer } from "../keyboardLexer";
%}
@lexer keyboardLexer

# ===================== Top-level commands ===================
# "air"
main -> decoratedMark {% command("targetDecoratedMarkReplace", ["decoratedMark"]) %}

# "past air"
main -> %makeRange decoratedMark {%
  command("targetDecoratedMarkExtend", [_, "decoratedMark"])
%}

# "and air"
main -> %makeList decoratedMark {%
  command("targetDecoratedMarkAppend", [_, "decoratedMark"])
%}

# "funk"
main -> scopeType {% command("modifyTargetContainingScope", ["scopeType"]) %}

# "every funk"
main -> %every scopeType {% command("targetEveryScopeType", [_, "scopeType"]) %}

# "[third] next [two] funks"
# "[third] previous [two] funks"
main -> offset:? %nextPrev number:? scopeType {%
  command(
    "targetRelativeExclusiveScope",
    ["offset", _, "length", "scopeType"],
  )
%}

# "three funks [backward]"
main -> offset scopeType {%
  command("targetRelativeInclusiveScope", ["offset", "scopeType"])
%}

# "chuck"
main -> %simpleAction {% command("performSimpleActionOnTarget", ["actionDescriptor"]) %}

# "round wrap"
main -> %wrap %pairedDelimiter {%
  command("performWrapActionOnTarget", [_, "delimiter"])
%}

# "tail funk"
main -> %tail scopeType {% command("targetTailScopeType", [_, "scopeType"]) %}
main -> %head scopeType {% command("targetHeadScopeType", [_, "scopeType"]) %}

# Custom vscode command
main -> %vscodeCommand {% command("vscodeCommand", ["command"]) %}

# ========================== Captures =========================
scopeType -> %simpleScopeTypeType {% capture("type") %}
scopeType -> %pairedDelimiter {%
  ([delimiter]) => ({ type: "surroundingPair", delimiter })
%}

decoratedMark ->
    %color {% capture("color") %}
  | %shape {% capture("shape") %}
  | %combineColorAndShape %color %shape {% capture(_, "color", "shape") %}
  | %combineColorAndShape %shape %color {% capture(_, "shape", "color") %}

# Contains a direction and a number for use with nextPrev and ordinal
offset ->
    %direction:? number {% capture("direction", "number") %}
  | number:? %direction {% capture("number", "direction") %}

number -> %digit:+ {%
  ([digits]) =>
    digits.reduce((total: number, digit: number) => total * 10 + digit, 0)
%}
