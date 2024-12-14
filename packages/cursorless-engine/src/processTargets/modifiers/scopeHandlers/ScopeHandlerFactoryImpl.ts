import type { ScopeType } from "@cursorless/common";
import type { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import {
  BoundedNonWhitespaceSequenceScopeHandler,
  BoundedParagraphScopeHandler,
} from "./BoundedScopeHandler";
import { CharacterScopeHandler } from "./CharacterScopeHandler";
import { CollectionItemScopeHandler } from "./CollectionItemScopeHandler/CollectionItemScopeHandler";
import { DocumentScopeHandler } from "./DocumentScopeHandler";
import { IdentifierScopeHandler } from "./IdentifierScopeHandler";
import { LineScopeHandler } from "./LineScopeHandler";
import { OneOfScopeHandler } from "./OneOfScopeHandler";
import { ParagraphScopeHandler } from "./ParagraphScopeHandler";
import {
  CustomRegexScopeHandler,
  GlyphScopeHandler,
  NonWhitespaceSequenceScopeHandler,
  UrlScopeHandler,
} from "./RegexScopeHandler";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { SentenceScopeHandler } from "./SentenceScopeHandler/SentenceScopeHandler";
import {
  SurroundingPairInteriorScopeHandler,
  SurroundingPairScopeHandler,
} from "./SurroundingPairScopeHandler";
import { TokenScopeHandler } from "./TokenScopeHandler";
import { WordScopeHandler } from "./WordScopeHandler/WordScopeHandler";
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
    this.maybeCreate = this.maybeCreate.bind(this);
    this.create = this.create.bind(this);
  }

  maybeCreate(
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
      case "sentence":
        return new SentenceScopeHandler(this, scopeType, languageId);
      case "paragraph":
        return new ParagraphScopeHandler(scopeType, languageId);
      case "boundedParagraph":
        return new BoundedParagraphScopeHandler(this, scopeType, languageId);
      case "document":
        return new DocumentScopeHandler(scopeType, languageId);
      case "oneOf":
        return OneOfScopeHandler.create(this, scopeType, languageId);
      case "nonWhitespaceSequence":
        return new NonWhitespaceSequenceScopeHandler(
          this,
          scopeType,
          languageId,
        );
      case "boundedNonWhitespaceSequence":
        return new BoundedNonWhitespaceSequenceScopeHandler(
          this,
          scopeType,
          languageId,
        );
      case "url":
        return new UrlScopeHandler(this, scopeType, languageId);
      case "customRegex":
        return new CustomRegexScopeHandler(this, scopeType, languageId);
      case "glyph":
        return new GlyphScopeHandler(this, scopeType, languageId);
      case "surroundingPair":
        return new SurroundingPairScopeHandler(
          this.languageDefinitions,
          scopeType,
          languageId,
        );
      case "surroundingPairInterior":
        return new SurroundingPairInteriorScopeHandler(
          this,
          scopeType,
          languageId,
        );
      case "collectionItem":
        return new CollectionItemScopeHandler(
          this.languageDefinitions,
          languageId,
        );
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

  create(
    scopeType: ScopeType | CustomScopeType,
    languageId: string,
  ): ScopeHandler {
    const handler = this.maybeCreate(scopeType, languageId);
    if (handler == null) {
      throw new Error(`Couldn't create scope handler for '${scopeType.type}'`);
    }
    return handler;
  }
}
