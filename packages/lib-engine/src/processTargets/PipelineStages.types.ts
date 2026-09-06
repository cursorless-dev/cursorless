import type { Target } from "../typings/target.types";

export interface MarkStage {
  run(): Target[];
}

export interface ModifierStateOptions {
  multipleTargets: boolean;
}

export interface ModifierStage {
  run(target: Target, options: ModifierStateOptions): Target[];
}
