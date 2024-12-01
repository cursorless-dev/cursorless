import type { ScopeType } from "@cursorless/common";
import type { CustomScopeType, ScopeHandler } from "./scopeHandler.types";

export interface ScopeHandlerFactory {
  maybeCreate(
    scopeType: ScopeType | CustomScopeType,
    languageId: string,
  ): ScopeHandler | undefined;

  create(
    scopeType: ScopeType | CustomScopeType,
    languageId: string,
  ): ScopeHandler;
}
