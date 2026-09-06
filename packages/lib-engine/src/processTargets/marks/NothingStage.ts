import type { NothingMark } from "@cursorless/lib-common";
import type { Target } from "../../typings/target.types";
import type { MarkStage } from "../PipelineStages.types";

export class NothingStage implements MarkStage {
  constructor(private mark: NothingMark) {}

  run(): Target[] {
    return [];
  }
}
