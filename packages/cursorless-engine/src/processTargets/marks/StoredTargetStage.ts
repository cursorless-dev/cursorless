import { StoredTargetKey, StoredTargetMap } from "../../core/StoredTargets";
import { Target } from "../../typings/target.types";
import { MarkStage } from "../PipelineStages.types";

export class StoredTargetStage implements MarkStage {
  constructor(
    private storedTargets: StoredTargetMap,
    private key: StoredTargetKey,
  ) {}

  run(): Target[] {
    const targets = this.storedTargets.get(this.key);

    if (targets == null || targets.length === 0) {
      throw Error(`No available ${this.key} marks`);
    }

    return targets;
  }
}
