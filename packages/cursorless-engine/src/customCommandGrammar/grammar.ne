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
  simplePartialMark,
} from "../grammarUtil";
%}
@lexer lexer

main -> action {%
  ([action]) => action
%}

# --------------------------- Actions ---------------------------

action -> %simpleActionName _ target {%
  ([simpleActionName, _, target]) => simpleActionDescriptor(simpleActionName, target)
%}

# --------------------------- Targets ---------------------------

target -> primitiveTarget {%
  ([primitiveTarget]) => primitiveTarget
%}

primitiveTarget -> modifiers {%
  ([modifiers]) => partialPrimitiveTargetDescriptor(modifiers)
%}

primitiveTarget -> mark {%
  ([mark]) => partialPrimitiveTargetDescriptor(undefined, mark)
%}

primitiveTarget -> modifiers _ mark {%
  ([modifiers, _, mark]) => partialPrimitiveTargetDescriptor(modifiers, mark)
%}

# --------------------------- Modifiers ---------------------------

modifiers -> modifier additionalModifier:* {%
  ([modifier, rest]) => [modifier, ...rest]
%}

additionalModifier -> _ modifier {%
  ([_, modifier]) => modifier
%}

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

# --------------------------- Marks ---------------------------

mark -> %simpleMarkType {%
  ([simpleMarkType]) => simplePartialMark(simpleMarkType)
%}

mark -> %placeholderMark {%
  ([placeholderMark]) => simplePartialMark(placeholderMark)
%}

_ -> [ \t]:+