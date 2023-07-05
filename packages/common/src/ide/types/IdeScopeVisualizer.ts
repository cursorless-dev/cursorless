import type { ScopeType, TextEditor } from "../..";
import { GeneralizedRange } from "../../types/GeneralizedRange";

interface ScopeRangeConfigBase {
  visibleOnly: boolean;
  scopeType: ScopeType;
}

export type ScopeRangeConfig = ScopeRangeConfigBase;

export interface IterationScopeRangeConfig extends ScopeRangeConfigBase {
  includeNestedTargets: boolean;
}

export type ScopeChangeEventCallback = (
  editor: TextEditor,
  scopeRanges: ScopeRanges[],
) => void;

export type IterationScopeChangeEventCallback = (
  editor: TextEditor,
  scopeRanges: IterationScopeRanges[],
) => void;

export interface ScopeRanges {
  domain: GeneralizedRange;
  targets: TargetRanges[];
}

export interface TargetRanges {
  contentRange: GeneralizedRange;
  removalRange: GeneralizedRange;
}

export interface IterationScopeRanges {
  domain: GeneralizedRange;
  ranges: {
    range: GeneralizedRange;
    targets?: TargetRanges[];
  }[];
}
