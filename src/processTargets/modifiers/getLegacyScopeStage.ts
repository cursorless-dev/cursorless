import {
  ContainingScopeModifier,
  EveryScopeModifier,
  SurroundingPairModifier,
} from "../../typings/targetDescriptor.types";
import { ModifierStage } from "../PipelineStages.types";
import ItemStage from "./ItemStage";
import BoundedNonWhitespaceSequenceStage from "./scopeTypeStages/BoundedNonWhitespaceStage";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
  SimpleEveryScopeModifier,
} from "./scopeTypeStages/ContainingSyntaxScopeStage";
import DocumentStage from "./scopeTypeStages/DocumentStage";
import NotebookCellStage from "./scopeTypeStages/NotebookCellStage";
import ParagraphStage from "./scopeTypeStages/ParagraphStage";
import {
  CustomRegexModifier,
  CustomRegexStage,
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./scopeTypeStages/RegexStage";
import { CharacterStage, WordStage } from "./scopeTypeStages/SubTokenStages";
import SurroundingPairStage from "./SurroundingPairStage";

export default function getLegacyScopeStage(
  modifier: ContainingScopeModifier | EveryScopeModifier
): ModifierStage {
  switch (modifier.scopeType.type) {
    case "notebookCell":
      return new NotebookCellStage(modifier);
    case "document":
      return new DocumentStage(modifier);
    case "paragraph":
      return new ParagraphStage(modifier);
    case "nonWhitespaceSequence":
      return new NonWhitespaceSequenceStage(modifier);
    case "boundedNonWhitespaceSequence":
      return new BoundedNonWhitespaceSequenceStage(modifier);
    case "url":
      return new UrlStage(modifier);
    case "collectionItem":
      return new ItemStage(modifier);
    case "customRegex":
      return new CustomRegexStage(modifier as CustomRegexModifier);
    case "word":
      return new WordStage(modifier);
    case "character":
      return new CharacterStage(modifier);
    case "surroundingPair":
      return new SurroundingPairStage(modifier as SurroundingPairModifier);
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(
        modifier as SimpleContainingScopeModifier | SimpleEveryScopeModifier
      );
  }
}
