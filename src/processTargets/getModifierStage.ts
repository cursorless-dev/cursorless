import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Modifier,
} from "../typings/target.types";
import BoundaryStage from "./modifiers/BoundaryStage";
import ContainingSyntaxScopeStage from "./modifiers/scopeTypeStages/ContainingSyntaxScopeStage";
import DocumentStage from "./modifiers/scopeTypeStages/DocumentStage";
import { HeadStage, TailStage } from "./modifiers/HeadTailStage";
import InteriorStage from "./modifiers/InteriorStage";
import LineStage from "./modifiers/scopeTypeStages/LineStage";
import NotebookCellStage from "./modifiers/scopeTypeStages/NotebookCellStage";
import ParagraphStage from "./modifiers/scopeTypeStages/ParagraphStage";
import PositionStage from "./modifiers/PositionStage";
import RawSelectionStage from "./modifiers/RawSelectionStage";
import {
  NonWhitespaceSequenceStage,
  UrlStage,
} from "./modifiers/scopeTypeStages/RegexStage";
import SubPieceStage from "./modifiers/SubPieceStage";
import SurroundingPairStage from "./modifiers/SurroundingPairStage";
import TokenStage from "./modifiers/scopeTypeStages/TokenStage";
import { ModifierStage } from "./PipelineStages.types";

export default (modifier: Modifier): ModifierStage => {
  switch (modifier.type) {
    case "position":
      return new PositionStage(modifier);
    case "head":
      return new HeadStage(modifier);
    case "tail":
      return new TailStage(modifier);
    case "toRawSelection":
      return new RawSelectionStage(modifier);
    case "subpiece":
      return new SubPieceStage(modifier);
    case "surroundingPair":
      return new SurroundingPairStage(modifier);
    case "interior":
      return new InteriorStage(modifier);
    case "boundary":
      return new BoundaryStage(modifier);
    case "containingScope":
    case "everyScope":
      return getContainingScopeStage(modifier);
  }
};

const getContainingScopeStage = (
  modifier: ContainingScopeModifier | EveryScopeModifier
): ModifierStage => {
  switch (modifier.scopeType) {
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
    case "url":
      return new UrlStage(modifier);
    default:
      // Default to containing syntax scope using tree sitter
      return new ContainingSyntaxScopeStage(modifier);
  }
};
