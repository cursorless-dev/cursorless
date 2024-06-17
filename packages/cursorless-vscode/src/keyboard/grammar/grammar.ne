@preprocessor typescript
@{%
import { capture, UNUSED as _, argPositions } from "@cursorless/cursorless-engine"
import { command } from "../command"
import { keyboardLexer } from "../keyboardLexer";

const { $0, $1, $2 } = argPositions;
%}
@lexer keyboardLexer

# ===================== Top-level commands ===================

# --------------------------- Mark --------------------------
# "air"
main -> %targetingMode:? decoratedMark {%
  command(
    "targetDecoratedMark",
    ([targetingMode, decoratedMark]) => ({ decoratedMark, mode: targetingMode ?? "replace" })
  )
%}

# Other marks
main -> %targetingMode:? mark {%
  command("targetMark", ([targetingMode, mark]) => ({ mark, mode: targetingMode ?? "replace" }))
%}

# --------------------------- Modifier --------------------------

main -> %targetingMode:? modifier {%
  command(
    "modifyTarget",
    ([targetingMode, modifier]) => ({ modifier, mode: targetingMode ?? "replace" })
  )
%}

# --------------------------- Actions --------------------------

# "chuck"
main -> %simpleAction {% command("performSimpleActionOnTarget", ["actionDescriptor"]) %}

# "round wrap"
main -> %wrap %pairedDelimiter {%
  command("performWrapActionOnTarget", ["actionDescriptor", "delimiter"])
%}

# Custom vscode command
main -> %vscodeCommand {% command("vscodeCommand", ["command"]) %}

# ========================== Captures =============================

# --------------------------- Modifiers ---------------------------

# "inside", "bounds"
modifier -> %simpleModifier {% capture({ type: $0 }) %}

# "funk"
modifier -> scopeType {% capture({ type: "containingScope", scopeType: $0 }) %}

# "every funk"
modifier -> %every scopeType {% capture({ type: "everyScope", scopeType: $1 }) %}

# "[third] next [two] funks"
# "[third] previous [two] funks"
modifier -> offset:? %nextPrev number:? scopeType {%
  ([offset, _, length, scopeType]) => ({
    type: "relativeScope",
    offset: offset?.number ?? 1,
    direction: offset?.direction ?? "forward",
    length: length ?? 1,
    scopeType,
  })
%}

# "three funks [backward]"
modifier -> offset scopeType {%
  ([offset, scopeType]) => ({
    type: "relativeScope",
    offset: 0,
    direction: offset?.direction ?? "forward",
    length: offset?.number ?? 1,
    scopeType,
  })
%}

# --------------------------- Scope types ---------------------------
scopeType -> %simpleScopeTypeType {% capture("type") %}
scopeType -> %pairedDelimiter {%
  ([delimiter]) => ({ type: "surroundingPair", delimiter })
%}

# --------------------------- Marks ---------------------------

# "this"
mark -> %simpleSpecialMark {% capture({ type: $0 }) %}

# --------------------------- Other ---------------------------
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
