import type { ScopeType } from "@cursorless/common";
import type { ComplexScopeType, ScopeHandler } from "./scopeHandler.types";

export interface ScopeHandlerFactory {
  maybeCreate(
    scopeType: ScopeType | ComplexScopeType,
    languageId: string,
  ): ScopeHandler | undefined;

  create(
    scopeType: ScopeType | ComplexScopeType,
    languageId: string,
  ): ScopeHandler;
}
