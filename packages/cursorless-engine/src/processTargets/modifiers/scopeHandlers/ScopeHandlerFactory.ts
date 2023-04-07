import type { ScopeType } from "@cursorless/common";
import type { ScopeHandler } from "./scopeHandler.types";

export interface ScopeHandlerFactory {
  create(scopeType: ScopeType, languageId: string): ScopeHandler | undefined;
}
