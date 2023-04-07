import { Mark } from "@cursorless/common";
import { MarkStage } from "./PipelineStages.types";
import CursorStage from "./marks/CursorStage";
import DecoratedSymbolStage from "./marks/DecoratedSymbolStage";
import LineNumberStage from "./marks/LineNumberStage";
import NothingStage from "./marks/NothingStage";
import RangeMarkStage from "./marks/RangeMarkStage";
import { SourceStage, ThatStage } from "./marks/ThatStage";
import { MarkStageFactory } from "./MarkStageFactory";

export class MarkStageFactoryImpl implements MarkStageFactory {
  constructor() {
    this.create = this.create.bind(this);
  }

  create(mark: Mark): MarkStage {
    switch (mark.type) {
      case "cursor":
        return new CursorStage(mark);
      case "that":
        return new ThatStage(mark);
      case "source":
        return new SourceStage(mark);
      case "decoratedSymbol":
        return new DecoratedSymbolStage(mark);
      case "lineNumber":
        return new LineNumberStage(mark);
      case "range":
        return new RangeMarkStage(this, mark);
      case "nothing":
        return new NothingStage(mark);
    }
  }
}
