import {
  pseudoScopes,
  UnsupportedScopeError,
  type ScopeType,
} from "@cursorless/common";
import type { LanguageDefinitions } from "../../../languages/LanguageDefinitions";
import {
  BoundedNonWhitespaceSequenceScopeHandler,
  BoundedParagraphScopeHandler,
} from "./BoundedScopeHandler";
import { CharacterScopeHandler } from "./CharacterScopeHandler";
import { CollectionItemScopeHandler } from "./CollectionItemScopeHandler/CollectionItemScopeHandler";
import { ConditionalScopeHandler } from "./ConditionalScopeHandler";
import { DocumentScopeHandler } from "./DocumentScopeHandler";
import { FallbackScopeHandler } from "./FallbackScopeHandler";
import { IdentifierScopeHandler } from "./IdentifierScopeHandler";
import { LineScopeHandler } from "./LineScopeHandler";
import { NotebookCellScopeHandler } from "./NotebookCellScopeHandler";
import { ParagraphScopeHandler } from "./ParagraphScopeHandler";
import {
  CustomRegexScopeHandler,
  GlyphScopeHandler,
  NonWhitespaceSequenceScopeHandler,
  UrlScopeHandler,
} from "./RegexScopeHandler";
import type { ComplexScopeType, ScopeHandler } from "./scopeHandler.types";
import type { ScopeHandlerFactory } from "./ScopeHandlerFactory";
import { SentenceScopeHandler } from "./SentenceScopeHandler/SentenceScopeHandler";
import { SortedScopeHandler } from "./SortedScopeHandler";
import {
  SurroundingPairInteriorScopeHandler,
  SurroundingPairScopeHandler,
} from "./SurroundingPairScopeHandler";
import { InteriorScopeHandler } from "./SurroundingPairScopeHandler/InteriorScopeHandler";
import { TokenScopeHandler } from "./TokenScopeHandler";
import { WordScopeHandler } from "./WordScopeHandler/WordScopeHandler";

/**
 * Returns a scope handler for the given scope type and language id, or
 * undefined if the given scope type / language id combination is not supported.
 *
 * @param scopeType The scope type for which to get a scope handler
 * @param languageId The language id of the document where the scope handler
 * will be used
 * @returns A scope handler for the given scope type and language id, or
 * undefined if the given scope type / language id combination is not supported.
 */
export class ScopeHandlerFactoryImpl implements ScopeHandlerFactory {
  constructor(private languageDefinitions: LanguageDefinitions) {
    this.maybeCreate = this.maybeCreate.bind(this);
    this.create = this.create.bind(this);
  }

  maybeCreate(
    scopeType: ScopeType | ComplexScopeType,
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
      case "fullLine":
        return new LineScopeHandler({ type: scopeType.type }, languageId);
      case "sentence":
        return new SentenceScopeHandler(this, scopeType, languageId);
      case "paragraph":
        return new ParagraphScopeHandler(scopeType, languageId);
      case "boundedParagraph":
        return new BoundedParagraphScopeHandler(this, scopeType, languageId);
      case "document":
        return new DocumentScopeHandler(scopeType, languageId);
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
      case "collectionItem":
        return new CollectionItemScopeHandler(
          this,
          this.languageDefinitions,
          languageId,
        );
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
      case "notebookCell":
        return new NotebookCellScopeHandler(
          this,
          this.languageDefinitions,
          scopeType,
          languageId,
        );
      case "interior":
        return new InteriorScopeHandler(
          this,
          this.languageDefinitions,
          scopeType,
          languageId,
        );
      case "custom":
        return scopeType.scopeHandler;
      case "oneOf":
        return SortedScopeHandler.create(this, scopeType, languageId);
      case "fallback":
        return FallbackScopeHandler.create(this, scopeType, languageId);
      case "conditional":
        return new ConditionalScopeHandler(this, scopeType, languageId);
      default:
        // Pseudoscopes are handled separately in their own modifiers.
        if (pseudoScopes.has(scopeType.type)) {
          throw Error(`Unexpected scope type '${scopeType.type}'`);
        }
        return this.languageDefinitions
          .get(languageId)
          ?.getScopeHandler(scopeType);
    }
  }

  create(
    scopeType: ScopeType | ComplexScopeType,
    languageId: string,
  ): ScopeHandler {
    const handler = this.maybeCreate(scopeType, languageId);
    if (handler == null) {
      throw new UnsupportedScopeError(scopeType.type);
    }
    return handler;
  }
}
