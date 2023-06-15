import { Target } from "../typings/target.types";

export interface MarkStage {
  run(): Target[];
}

export interface ModifierStage {
  run(target: Target): Target[];
}
