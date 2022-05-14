import { PipelineStageDescriptor } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import CursorStage from "./CursorStage";
import CursorTokenStage from "./CursorTokenStage";
import DecoratedSymbolStage from "./DecoratedSymbolStage";
import LineNumberStage from "./LineNumberStage";
import NothingStage from "./NothingStage";
import PipelineStage from "./PipelineStage";
import PositionStage from "./PositionStage";
import SourceStage from "./SourceStage";
import ThatStage from "./ThatStage";

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
    case "that":
      return new ThatStage();
    case "source":
      return new SourceStage();
    case "cursorToken":
      return new CursorTokenStage();
    case "decoratedSymbol":
      return new DecoratedSymbolStage();
    case "lineNumber":
      return new LineNumberStage();
    case "nothing":
      return new NothingStage();
    // Modifiers
    case "position":
      return new PositionStage();

    default:
      throw Error("Unknown pipeline stage " + stageDescriptor.type);
  }
};
