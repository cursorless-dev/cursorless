@preprocessor typescript
@{%
import { capture } from "../../util/grammarHelpers";
import { lexer } from "../lexer";
import {
  bringMoveActionDescriptor,
  containingScopeModifier,
  partialPrimitiveTargetDescriptor,
  createPlaceholderMark,
  primitiveDestinationDescriptor,
  simpleActionDescriptor,
  simplePartialMark,
  simpleScopeType,
  surroundingPairScopeType,
} from "../grammarUtil";
%}
@lexer lexer

main -> action {%
  ([action]) => action
%}

# --------------------------- Actions ---------------------------

action -> %simpleActionName target {%
  ([simpleActionName, target]) => simpleActionDescriptor(simpleActionName, target)
%}

action -> %bringMove target destination {%
  ([bringMove, target, destination]) => bringMoveActionDescriptor(bringMove, target, destination)
%}

# --------------------------- Destinations ---------------------------

destination -> primitiveDestination {% id %}

destination -> %insertionMode target {%
  ([insertionMode, target]) => primitiveDestinationDescriptor(insertionMode, target)
%}

# --------------------------- Targets ---------------------------

target -> primitiveTarget {% id %}

primitiveTarget -> modifier:+ {%
  ([modifiers]) => partialPrimitiveTargetDescriptor(modifiers)
%}

primitiveTarget -> mark {%
  ([mark]) => partialPrimitiveTargetDescriptor(undefined, mark)
%}

primitiveTarget -> modifier:+ mark {%
  ([modifiers, mark]) => partialPrimitiveTargetDescriptor(modifiers, mark)
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

# --------------------------- Marks ---------------------------

mark -> %simpleMarkType {%
  ([simpleMarkType]) => simplePartialMark(simpleMarkType)
%}

mark -> %placeholderMark {%
  ([placeholderMark]) => createPlaceholderMark(placeholderMark)
%}
