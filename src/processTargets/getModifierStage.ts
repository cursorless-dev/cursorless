import {
  ContainingScopeModifier,
  EveryScopeModifier,
  Modifier,
} from "../typings/target.types";
import ContainingScopeStage from "./modifiers/ContainingScopeStage";
import DocumentStage from "./modifiers/DocumentStage";
import { HeadStage, TailStage } from "./modifiers/HeadTailStage";
import LineStage from "./modifiers/LineStage";
import NotebookCellStage from "./modifiers/NotebookCellStage";
import ParagraphStage from "./modifiers/ParagraphStage";
import PositionStage from "./modifiers/PositionStage";
import RawSelectionStage from "./modifiers/RawSelectionStage";
import { NonWhitespaceSequenceStage, UrlStage } from "./modifiers/RegexStage";
import SubPieceStage from "./modifiers/SubPieceStage";
import SurroundingPairStage from "./modifiers/SurroundingPairStage";
import TokenStage from "./modifiers/TokenStage";
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
      return new ContainingScopeStage(modifier);
  }
};
