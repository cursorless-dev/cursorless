import { Mark, ReadOnlyHatMap } from "@cursorless/common";
import { StoredTargets } from "../core/StoredTargets";
import { MarkStageFactory } from "./MarkStageFactory";
import { MarkStage } from "./PipelineStages.types";
import CursorStage from "./marks/CursorStage";
import DecoratedSymbolStage from "./marks/DecoratedSymbolStage";
import LineNumberStage from "./marks/LineNumberStage";
import NothingStage from "./marks/NothingStage";
import RangeMarkStage from "./marks/RangeMarkStage";
import { StoredTargetStage } from "./marks/StoredTargetStage";

export class MarkStageFactoryImpl implements MarkStageFactory {
  constructor(
    private readableHatMap: ReadOnlyHatMap,
    private thatMark: StoredTargets,
    private sourceMark: StoredTargets,
  ) {
    this.create = this.create.bind(this);
  }

  create(mark: Mark): MarkStage {
    switch (mark.type) {
      case "cursor":
        return new CursorStage(mark);
      case "that":
        return new StoredTargetStage(this.thatMark, mark);
      case "source":
        return new StoredTargetStage(this.sourceMark, mark);
      case "decoratedSymbol":
        return new DecoratedSymbolStage(this.readableHatMap, mark);
      case "lineNumber":
        return new LineNumberStage(mark);
      case "range":
        return new RangeMarkStage(this, mark);
      case "nothing":
        return new NothingStage(mark);
    }
  }
}
