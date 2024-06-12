@preprocessor typescript
@{%
import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";
%}
@lexer lexer

main -> scopeType

# --------------------------- Scope types ---------------------------
scopeType -> %simpleScopeTypeType {% capture("type") %}
scopeType -> %pairedDelimiter {%
  ([delimiter]) => ({ type: "surroundingPair", delimiter })
%}
