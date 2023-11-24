@preprocessor typescript
@{%
import { capture, command } from "../grammarHelpers"
import { lexer } from "../lexer";
%}
@lexer lexer

# ===================== Top-level commands ===================
# "air"
main -> decoratedMark {% command("targetDecoratedMarkReplace", ["decoratedMark"]) %}

# "past air"
main -> %makeRange decoratedMark {%
  command("targetDecoratedMarkExtend", [null, "decoratedMark"])
%}

# "funk"
main -> scopeType {% command("targetScopeType", ["scopeType"]) %}

# "third next two funks"
# "third previous two funks"
main -> offset:? %relative number:? scopeType {%
  command(
    "targetRelativeScope",
    ["offset", null, "length", "scopeType"],
  )
%}

# "chuck"
main -> %simpleAction {% command("performSimpleActionOnTarget", ["actionName"]) %}

# Custom vscode command
main -> %vscodeCommand {% command("vscodeCommand", ["command"]) %}

# ========================== Captures =========================
scopeType -> %simpleScopeTypeType {% capture("type") %}

decoratedMark -> %color {% capture("color") %}
decoratedMark -> %shape {% capture("shape") %}
decoratedMark -> %combineColorAndShape %color %shape {%
  capture(null, "color", "shape")
%}
decoratedMark -> %combineColorAndShape %shape %color {%
  capture(null, "shape", "color")
%}

# Contains a direction and a number for use with relative and ordinal
offset -> %direction:? number {% capture("direction", "number") %}
offset -> number:? %direction {% capture("number", "direction") %}

number -> %digit:+ {%
  ([digits]) =>
    digits.reduce((total: number, digit: number) => total * 10 + digit, 0)
%}
