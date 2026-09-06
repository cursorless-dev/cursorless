import type { IDE, ReadOnlyHatMap } from "@cursorless/lib-common";
import type { TargetPipelineRunner } from ".";
import type { StoredTargetMap } from "..";
import type { Mark } from "../typings/TargetDescriptor";
import { CursorStage } from "./marks/CursorStage";
import { DecoratedSymbolStage } from "./marks/DecoratedSymbolStage";
import { ExplicitMarkStage } from "./marks/ExplicitMarkStage";
import { LineNumberStage } from "./marks/LineNumberStage";
import { NothingStage } from "./marks/NothingStage";
import { RangeMarkStage } from "./marks/RangeMarkStage";
import { StoredTargetStage } from "./marks/StoredTargetStage";
import { TargetMarkStage } from "./marks/TargetMarkStage";
import type { MarkStageFactory } from "./MarkStageFactory";
import type { MarkStage } from "./PipelineStages.types";

export class MarkStageFactoryImpl implements MarkStageFactory {
  private targetPipelineRunner!: TargetPipelineRunner;

  setPipelineRunner(targetPipelineRunner: TargetPipelineRunner) {
    this.targetPipelineRunner = targetPipelineRunner;
  }

  constructor(
    private ide: IDE,
    private readableHatMap: ReadOnlyHatMap,
    private storedTargets: StoredTargetMap,
  ) {
    this.create = this.create.bind(this);
  }

  create(mark: Mark): MarkStage {
    switch (mark.type) {
      case "cursor":
        return new CursorStage(this.ide);
      case "that":
      case "source":
      case "keyboard":
        return new StoredTargetStage(this.storedTargets, mark.type);
      case "decoratedSymbol":
        return new DecoratedSymbolStage(this.readableHatMap, mark);
      case "lineNumber":
        return new LineNumberStage(this.ide, mark);
      case "range":
        return new RangeMarkStage(this, mark);
      case "nothing":
        return new NothingStage(mark);
      case "target":
        return new TargetMarkStage(this.targetPipelineRunner, mark);
      case "explicit":
        return new ExplicitMarkStage(this.ide, mark);
      default: {
        // Ensure we don't miss any new marks. Needed because we don't have input validation.
        // FIXME: remove once we have schema validation (#983)
        const _exhaustiveCheck: never = mark;
        const { type } = mark;
        throw new Error(`Unknown mark: ${type}`);
      }
    }
  }
}
