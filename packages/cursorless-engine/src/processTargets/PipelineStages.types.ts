import { Target } from "../typings/target.types";

export interface MarkStage {
  run(): Promise<Target[]>;
}

export interface ModifierStage {
  run(target: Target): Promise<Target[]>;
}
