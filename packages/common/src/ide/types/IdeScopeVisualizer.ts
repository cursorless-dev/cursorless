import type { ScopeType, TextEditor } from "../..";
import { GeneralizedRange } from "../../types/GeneralizedRange";

export interface ScopeRenderer {
  setScopes(
    editor: TextEditor,
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ): Promise<void>;

  visualizerConfig: ScopeVisualizerConfig;
}

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

export interface ScopeVisualizerConfig {
  scopeType: ScopeType;
  includeScopes: boolean;
  includeIterationScopes: boolean;
  includeIterationNestedTargets: boolean;
}
