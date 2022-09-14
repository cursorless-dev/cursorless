import {
  ContainingScopeModifier,
  ContainingSurroundingPairModifier,
  EveryScopeModifier,
  Modifier,
} from "../typings/targetDescriptor.types";
import BoundedNonWhitespaceSequenceStage from "./modifiers/BoundedNonWhitespaceStage";
import CascadingStage from "./modifiers/CascadingStage";
import { HeadStage, TailStage } from "./modifiers/HeadTailStage";
import {
  ExcludeInteriorStage,
  InteriorOnlyStage,
} from "./modifiers/InteriorStage";
import ItemStage from "./modifiers/ItemStage";
import { LeadingStage, TrailingStage } from "./modifiers/LeadingTrailingStages";
import ModifyIfUntypedStage from "./modifiers/ModifyIfUntypedStage";
import OrdinalRangeSubTokenStage, {
  OrdinalRangeSubTokenModifier,
} from "./modifiers/OrdinalRangeSubTokenStage";
import PositionStage from "./modifiers/PositionStage";
import PreviousNextContainingScopeStage from "./modifiers/PreviousNextContainingScopeStage";
import RawSelectionStage from "./modifiers/RawSelectionStage";
import ContainingSyntaxScopeStage, {
  SimpleContainingScopeModifier,
} from "./modifiers/scopeTypeStages/ContainingSyntaxScopeStage";
import DocumentStage from "./modifiers/scopeTypeStages/DocumentStage";
import LineStage from "./modifiers/scopeTypeStages/LineStage";
import NotebookCellStage from "./modifiers/scopeTypeStages/NotebookCellStage";
import ParagraphStage from "./modifiers/scopeTypeStages/ParagraphStage";
import {
  CustomRegexModifier,
  CustomRegexStage,
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./modifiers/scopeTypeStages/RegexStage";
import TokenStage from "./modifiers/scopeTypeStages/TokenStage";
import SurroundingPairStage from "./modifiers/SurroundingPairStage";
import { ModifierStage } from "./PipelineStages.types";

export default (modifier: Modifier): ModifierStage => {
  switch (modifier.type) {
    case "position":
      return new PositionStage(modifier);
    case "extendThroughStartOf":
      return new HeadStage(modifier);
    case "extendThroughEndOf":
      return new TailStage(modifier);
    case "toRawSelection":
      return new RawSelectionStage(modifier);
    case "interiorOnly":
      return new InteriorOnlyStage(modifier);
    case "excludeInterior":
      return new ExcludeInteriorStage(modifier);
    case "leading":
      return new LeadingStage(modifier);
    case "trailing":
      return new TrailingStage(modifier);
    case "containingScope":
    case "everyScope":
      return getContainingScopeStage(modifier);
    case "previousContainingScope":
    case "nextContainingScope":
      return new PreviousNextContainingScopeStage(modifier);
    case "ordinalRange":
      if (!["word", "character"].includes(modifier.scopeType.type)) {
        throw Error(
          `Unsupported ordinal scope type ${modifier.scopeType.type}`
        );
      }
      return new OrdinalRangeSubTokenStage(
        modifier as OrdinalRangeSubTokenModifier
      );
    case "cascading":
      return new CascadingStage(modifier);
    case "modifyIfUntyped":
      return new ModifyIfUntypedStage(modifier);
  }
};

const getContainingScopeStage = (
  modifier: ContainingScopeModifier | EveryScopeModifier
): ModifierStage => {
  switch (modifier.scopeType.type) {
    case "token":
      return new TokenStage(modifier);
    case "notebookCell":
      return new NotebookCellStage(modifier);
    case "document":
      return new DocumentStage(modifier);
    case "line":
      return new LineStage(modifier);
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
    case "surroundingPair":
      return new SurroundingPairStage(
        modifier as ContainingSurroundingPairModifier
      );
    case "word":
    case "character":
      throw new Error(`Unsupported scope type ${modifier.scopeType.type}`);
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(
        modifier as SimpleContainingScopeModifier
      );
  }
};
