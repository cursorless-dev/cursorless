import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";
import { MarkStageFactory, MarkStageFactoryOpts } from "../MarkStageFactory";
import { StoredTargetMap } from "../..";

export class ImplicitMarkStage implements MarkStage {
  private cursorMarkStage: MarkStage;

  constructor(
    markStageFactory: MarkStageFactory,
    private opts: MarkStageFactoryOpts,
    private storedTargets: StoredTargetMap,
  ) {
    this.cursorMarkStage = markStageFactory.create(
      { type: "cursor" },
      { isForInstance: this.opts.isForInstance },
    );
  }

  run(): Target[] {
    if (this.opts.isForInstance) {
      return this.cursorMarkStage.run();
    }

    return this.storedTargets.get("implicit") ?? this.cursorMarkStage.run();
  }
}
