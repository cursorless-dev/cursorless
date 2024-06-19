@preprocessor typescript
@{%
import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";
import {
  simpleActionDescriptor,
  partialPrimitiveTargetDescriptor,
  containingScopeModifier,
  simpleScopeType,
  surroundingPairScopeType,
} from "../grammarUtil";
%}
@lexer lexer

main -> action {%
  ([action]) => action
%}

# --------------------------- Actions ---------------------------

action -> %simpleActionName %ws target {%
  ([simpleActionName, ws, target]) => simpleActionDescriptor(simpleActionName, target)
%}

# --------------------------- Targets ---------------------------

target -> primitiveTarget {%
  ([primitiveTarget]) => primitiveTarget
%}

primitiveTarget -> modifier {%
  ([modifier]) => partialPrimitiveTargetDescriptor(modifier)
%}

# --------------------------- Modifiers ---------------------------

modifier -> containingScopeModifier {%
  ([containingScopeModifier]) => containingScopeModifier
%}

containingScopeModifier -> scopeType {%
  ([scopeType]) => containingScopeModifier(scopeType)
%}

# --------------------------- Scope types ---------------------------

scopeType -> %simpleScopeTypeType {%
  ([simpleScopeTypeType]) => simpleScopeType(simpleScopeTypeType)
%}

scopeType -> %pairedDelimiter {%
  ([delimiter]) => surroundingPairScopeType(delimiter)
%}
