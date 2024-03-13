import { Target } from "../../typings/target.types";
import { NothingMark } from "@cursorless/common";
import { MarkStage } from "../PipelineStages.types";

export class NothingStage implements MarkStage {
  constructor(private mark: NothingMark) {}

  async run(): Promise<Target[]> {
    return [];
  }
}
