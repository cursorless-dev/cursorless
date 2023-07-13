import {
  Disposable,
  GeneralizedRange,
  ScopeType,
  TextEditor,
} from "@cursorless/common";

export interface ScopeProvider {
  provideScopeRanges: (
    editor: TextEditor,
    config: ScopeRangeConfig,
  ) => ScopeRanges[];

  provideIterationScopeRanges: (
    editor: TextEditor,
    config: IterationScopeRangeConfig,
  ) => IterationScopeRanges[];

  onDidChangeScopeRanges: (
    callback: ScopeChangeEventCallback,
    config: ScopeRangeConfig,
  ) => Disposable;

  onDidChangeIterationScopeRanges: (
    callback: IterationScopeChangeEventCallback,
    config: IterationScopeRangeConfig,
  ) => Disposable;

  getScopeSupport: (editor: TextEditor, scopeType: ScopeType) => ScopeSupport;

  getIterationScopeSupport: (
    editor: TextEditor,
    scopeType: ScopeType,
  ) => ScopeSupport;
}

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

export enum ScopeSupport {
  supportedAndPresentInEditor,
  supportedButNotPresentInEditor,
  supportedLegacy,
  unsupported,
}
