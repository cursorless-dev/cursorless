import { Target } from "../../typings/target.types";
import { SourceMark, ThatMark } from "@cursorless/common";
import { MarkStage } from "../PipelineStages.types";
import { StoredTargets } from "../..";

export class StoredTargetStage implements MarkStage {
  constructor(
    private storedTargets: StoredTargets,
    private mark: ThatMark | SourceMark,
  ) {}

  run(): Target[] {
    const targets = this.storedTargets.get();

    if (targets == null || targets.length === 0) {
      throw Error(`No available ${this.mark.type} marks`);
    }

    return targets;
  }
}
