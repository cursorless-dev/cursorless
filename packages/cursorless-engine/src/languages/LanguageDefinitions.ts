import { ScopeType } from "@cursorless/common";
import { ScopeHandler } from "../processTargets/modifiers/scopeHandlers/scopeHandler.types";

export interface LanguageDefinitions {
  get(languageId: string): LanguageDefinition | undefined;
}

export interface LanguageDefinition {
  maybeGetLanguageScopeHandler: (
    scopeType: ScopeType,
  ) => ScopeHandler | undefined;
}
