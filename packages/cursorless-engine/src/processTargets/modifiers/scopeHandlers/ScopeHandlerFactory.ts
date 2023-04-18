import type { ScopeType } from "@cursorless/common";
import type { CustomScopeType, ScopeHandler } from "./scopeHandler.types";

export interface ScopeHandlerFactory {
  create(
    scopeType: ScopeType | CustomScopeType,
    languageId: string,
  ): ScopeHandler | undefined;
}
