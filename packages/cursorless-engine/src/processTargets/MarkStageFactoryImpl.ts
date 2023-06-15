import { ReadOnlyHatMap } from "@cursorless/common";
import { StoredTargetMap } from "..";
import { MarkStageFactory } from "./MarkStageFactory";
import { MarkStage } from "./PipelineStages.types";
import CursorStage from "./marks/CursorStage";
import DecoratedSymbolStage from "./marks/DecoratedSymbolStage";
import LineNumberStage from "./marks/LineNumberStage";
import NothingStage from "./marks/NothingStage";
import RangeMarkStage from "./marks/RangeMarkStage";
import { StoredTargetStage } from "./marks/StoredTargetStage";
import { Mark } from "../typings/TargetDescriptor";
import { TargetPipelineRunner } from ".";
import { TargetMarkStage } from "./marks/TargetMarkStage";

export class MarkStageFactoryImpl implements MarkStageFactory {
  private targetPipelineRunner!: TargetPipelineRunner;

  setPipelineRunner(targetPipelineRunner: TargetPipelineRunner) {
    this.targetPipelineRunner = targetPipelineRunner;
  }

  constructor(
    private readableHatMap: ReadOnlyHatMap,
    private storedTargets: StoredTargetMap,
  ) {
    this.create = this.create.bind(this);
  }

  create(mark: Mark): MarkStage {
    switch (mark.type) {
      case "cursor":
        return new CursorStage(mark);
      case "that":
      case "source":
        return new StoredTargetStage(this.storedTargets, mark.type);
      case "decoratedSymbol":
        return new DecoratedSymbolStage(this.readableHatMap, mark);
      case "lineNumber":
        return new LineNumberStage(mark);
      case "range":
        return new RangeMarkStage(this, mark);
      case "nothing":
        return new NothingStage(mark);
      case "target":
        return new TargetMarkStage(this.targetPipelineRunner, mark);
    }
  }
}
