import type { ScopeType } from "@cursorless/lib-common";
import type { ComplexScopeType } from "./scopeHandlers/scopeHandler.types";

export interface ComplexContainingScopeModifier {
  type: "complexContainingScope";
  scopeType: ScopeType | ComplexScopeType;
  ancestorIndex?: number;
}

export type ComplexModifier = ComplexContainingScopeModifier;
