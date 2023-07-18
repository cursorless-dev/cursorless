import {
  GeneralizedRange,
  Range,
  ScopeType,
  TextEditor,
} from "@cursorless/common";

export interface ScopeProvider {
  /**
   * Get the scope ranges for the given editor.
   * @param editor The editor
   * @param config The configuration for the scope ranges
   * @returns A list of scope ranges for the given editor
   */
  provideScopeRanges: (
    editor: TextEditor,
    config: ScopeRangeConfig,
  ) => ScopeRanges[];
  /**
   * Get the iteration scope ranges for the given editor.
   * @param editor The editor
   * @param config The configuration for the scope ranges
   * @returns A list of scope ranges for the given editor
   */
  provideIterationScopeRanges: (
    editor: TextEditor,
    config: IterationScopeRangeConfig,
  ) => IterationScopeRanges[];
}

interface ScopeRangeConfigBase {
  /**
   * Whether to only include visible scopes
   */
  visibleOnly: boolean;

  /**
   * The scope type to use
   */
  scopeType: ScopeType;
}

export type ScopeRangeConfig = ScopeRangeConfigBase;

export interface IterationScopeRangeConfig extends ScopeRangeConfigBase {
  /**
   * Whether to include nested targets in each iteration scope range
   */
  includeNestedTargets: boolean;
}

/**
 * Contains the ranges that define a given scope, eg its {@link domain} and the
 * ranges for its {@link targets}.
 */
export interface ScopeRanges {
  domain: Range;
  targets: TargetRanges[];
}

/**
 * Contains the ranges that define a given target, eg its {@link contentRange}
 * and the ranges for its {@link removalHighlightRange}.
 */
export interface TargetRanges {
  contentRange: Range;
  removalHighlightRange: GeneralizedRange;
}

/**
 * Contains the ranges that define a given iteration scope, eg its
 * {@link domain}.
 */
export interface IterationScopeRanges {
  domain: Range;

  /**
   * A list of ranges within within which iteration will happen.  There is
   * almost always a single range here.  There will be more than one if the
   * iteration scope handler returns a scope whose `getTargets` method returns
   * multiple targets.  As of this writing, no scope handler returns multiple
   * targets.
   */
  ranges: {
    /**
     * The range within which iteration will happen, ie the content range for
     * the target returned by the iteration scope handler.
     */
    range: Range;

    /**
     * The defining ranges for all targets within this iteration range.
     */
    targets?: TargetRanges[];
  }[];
}
