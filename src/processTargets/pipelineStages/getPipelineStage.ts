import {
  ContainingScopeModifier,
  PipelineStageDescriptor,
} from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import ContainingScopeStage from "./ContainingScopeStage";
import CursorStage from "./CursorStage";
import CursorTokenStage from "./CursorTokenStage";
import DecoratedSymbolStage from "./DecoratedSymbolStage";
import DocumentStage from "./DocumentStage";
import { HeadStage, TailStage } from "./HeadTailStage";
import LineNumberStage from "./LineNumberStage";
import LineStage from "./LineStage";
import NothingStage from "./NothingStage";
import ParagraphStage from "./ParagraphStage";
import PipelineStage from "./PipelineStage";
import PositionStage from "./PositionStage";
import RawSelectionStage from "./RawSelectionStage";
import SourceStage from "./SourceStage";
import SubPieceStage from "./SubPieceStage";
import SurroundingPairStage from "./SurroundingPairStage";
import ThatStage from "./ThatStage";
import TokenStage from "./TokenStage";

export default (stageDescriptor: PipelineStageDescriptor) => {
  const stage = getStage(stageDescriptor);
  return (
    context: ProcessedTargetsContext,
    stageDescriptor: PipelineStageDescriptor,
    selection?: TypedSelection
  ) => {
    const stageResult = stage.run(context, stageDescriptor, selection);
    if (!Array.isArray(stageResult)) {
      return [stageResult];
    }
    return stageResult;
  };
};

const getStage = (stageDescriptor: PipelineStageDescriptor): PipelineStage => {
  switch (stageDescriptor.type) {
    // Mark/source stages
    case "cursor":
      return new CursorStage();
    case "cursorToken":
      return new CursorTokenStage();
    case "that":
      return new ThatStage();
    case "source":
      return new SourceStage();
    case "decoratedSymbol":
      return new DecoratedSymbolStage();
    case "lineNumber":
      return new LineNumberStage();
    case "nothing":
      return new NothingStage();

    // Modifiers
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
      return getContainingScopeStage(stageDescriptor);
    // case "everyScope":

    default:
      // Make sure we haven't missed any cases
      const _neverCheck: never = stageDescriptor.type;
  }
};

const getContainingScopeStage = (
  stage: ContainingScopeModifier
): PipelineStage => {
  switch (stage.scopeType) {
    case "token":
      return new TokenStage();
    case "notebookCell":
    //   return processNotebookCell(target, selection, selectionContext);
    case "document":
      return new DocumentStage();
    case "line":
      return new LineStage();
    case "paragraph":
      return new ParagraphStage();
    //   return processParagraph(target, selection, selectionContext);
    case "nonWhitespaceSequence":
    //   return processRegexDefinedScope(
    //     /\S+/g,
    //     target,
    //     selection,
    //     selectionContext
    //   );
    case "url":
    //   return processRegexDefinedScope(
    //     URL_REGEX,
    //     target,
    //     selection,
    //     selectionContext
    //   );

    default:
      syntaxBased(context);
  }
};
