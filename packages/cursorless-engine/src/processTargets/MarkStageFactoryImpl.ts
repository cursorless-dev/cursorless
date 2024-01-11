import { ReadOnlyHatMap } from "@cursorless/common";
import { TargetPipelineRunner } from ".";
import { StoredTargetMap } from "..";
import { Mark } from "../typings/TargetDescriptor";
import { MarkStageFactory, MarkStageFactoryOpts } from "./MarkStageFactory";
import { MarkStage } from "./PipelineStages.types";
import { CursorStage } from "./marks/CursorStage";
import { DecoratedSymbolStage } from "./marks/DecoratedSymbolStage";
import { ExplicitMarkStage } from "./marks/ExplicitMarkStage";
import { LineNumberStage } from "./marks/LineNumberStage";
import { NothingStage } from "./marks/NothingStage";
import { RangeMarkStage } from "./marks/RangeMarkStage";
import { StoredTargetStage } from "./marks/StoredTargetStage";
import { TargetMarkStage } from "./marks/TargetMarkStage";
import { ImplicitMarkStage } from "./marks/ImplicitMarkStage";

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

  create(mark: Mark, opts: MarkStageFactoryOpts): MarkStage {
    switch (mark.type) {
      case "cursor":
        return new CursorStage(mark);
      case "implicit":
        return new ImplicitMarkStage(this, opts, this.storedTargets);
      case "that":
      case "source":
        return new StoredTargetStage(this.storedTargets, mark.type);
      case "decoratedSymbol":
        return new DecoratedSymbolStage(this.readableHatMap, mark);
      case "lineNumber":
        return new LineNumberStage(mark);
      case "range":
        return new RangeMarkStage(this, opts, mark);
      case "nothing":
        return new NothingStage(mark);
      case "target":
        return new TargetMarkStage(this.targetPipelineRunner, mark);
      case "explicit":
        return new ExplicitMarkStage(mark);
    }
  }
}
