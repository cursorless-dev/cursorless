import type { ScopeType } from "@cursorless/common";
import {
  CharacterScopeHandler,
  DocumentScopeHandler,
  IdentifierScopeHandler,
  LineScopeHandler,
  OneOfScopeHandler,
  ParagraphScopeHandler,
  TokenScopeHandler,
  WordScopeHandler,
} from ".";
import { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import type { CustomScopeType, ScopeHandler } from "./scopeHandler.types";

/**
 * Returns a scope handler for the given scope type and language id, or
 * undefined if the given scope type / language id combination is still using
 * legacy pathways.
 *
 * Note that once all our scope types are migrated to the new scope handler
 * setup for all languages, we can stop returning `undefined`, change the return
 * type of this function, and remove the legacy checks in the clients of this
 * function.
 *
 * @param scopeType The scope type for which to get a scope handler
 * @param languageId The language id of the document where the scope handler
 * will be used
 * @returns A scope handler for the given scope type and language id, or
 * undefined if the given scope type / language id combination is still using
 * legacy pathways
 */
export class ScopeHandlerFactoryImpl implements ScopeHandlerFactory {
  constructor(private languageDefinitions: LanguageDefinitions) {
    this.create = this.create.bind(this);
  }

  create(
    scopeType: ScopeType | CustomScopeType,
    languageId: string,
  ): ScopeHandler | undefined {
    switch (scopeType.type) {
      case "character":
        return new CharacterScopeHandler(this, scopeType, languageId);
      case "word":
        return new WordScopeHandler(this, scopeType, languageId);
      case "token":
        return new TokenScopeHandler(this, scopeType, languageId);
      case "identifier":
        return new IdentifierScopeHandler(this, scopeType, languageId);
      case "line":
        return new LineScopeHandler(scopeType, languageId);
      case "document":
        return new DocumentScopeHandler(scopeType, languageId);
      case "oneOf":
        return OneOfScopeHandler.create(this, scopeType, languageId);
      case "paragraph":
        return new ParagraphScopeHandler(scopeType, languageId);
      case "custom":
        return scopeType.scopeHandler;
      case "instance":
        // Handle instance pseudoscope with its own special modifier
        throw Error("Unexpected scope type 'instance'");
      default:
        return this.languageDefinitions
          .get(languageId)
          ?.getScopeHandler(scopeType);
    }
  }
}
