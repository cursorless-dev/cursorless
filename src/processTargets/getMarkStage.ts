import { Mark } from "../typings/target.types";
import CursorStage from "./marks/CursorStage";
import CursorTokenStage from "./marks/CursorTokenStage";
import DecoratedSymbolStage from "./marks/DecoratedSymbolStage";
import LineNumberStage from "./marks/LineNumberStage";
import NothingStage from "./marks/NothingStage";
import SourceStage from "./marks/SourceStage";
import ThatStage from "./marks/ThatStage";
import { MarkStage } from "./PipelineStages.types";

export default (mark: Mark): MarkStage => {
  switch (mark.type) {
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
  }
};
