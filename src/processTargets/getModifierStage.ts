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
      return new PositionStage();
    case "head":
      return new HeadStage();
    case "tail":
      return new TailStage();
    case "toRawSelection":
      return new RawSelectionStage();
    case "subpiece":
      return new SubPieceStage();
    case "surroundingPair":
      return new SurroundingPairStage();
    case "containingScope":
    case "everyScope":
      return getContainingScopeStage(modifier);
  }
};

const getContainingScopeStage = (
  stage: ContainingScopeModifier | EveryScopeModifier
): ModifierStage => {
  switch (stage.scopeType) {
    case "token":
      return new TokenStage();
    case "notebookCell":
      return new NotebookCellStage();
    case "document":
      return new DocumentStage();
    case "line":
      return new LineStage();
    case "paragraph":
      return new ParagraphStage();
    case "nonWhitespaceSequence":
      return new NonWhitespaceSequenceStage();
    case "url":
      return new UrlStage();
    default:
      return new ContainingScopeStage();
  }
};
