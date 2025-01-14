import type {
  Disposable,
  GeneralizedRange,
  Range,
  ScopeType,
  SpokenForm,
  TextEditor,
} from "..";

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

  /**
   * Registers a callback to be run when the scope ranges change for any visible
   * editor.  The callback will be run immediately once for each visible editor
   * with the current scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeRanges: (
    callback: ScopeChangeEventCallback,
    config: ScopeRangeConfig,
  ) => Disposable;

  /**
   * Registers a callback to be run when the iteration scope ranges change for
   * any visible editor.  The callback will be run immediately once for each
   * visible editor with the current iteration scope ranges.
   * @param callback The callback to run when the scope ranges change
   * @param config The configuration for the scope ranges
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeIterationScopeRanges: (
    callback: IterationScopeChangeEventCallback,
    config: IterationScopeRangeConfig,
  ) => Disposable;

  /**
   * Determine the level of support for {@link scopeType} in {@link editor}, as
   * determined by its language id.
   * @param editor The editor to check
   * @param scopeType The scope type to check
   * @returns The level of support for {@link scopeType} in {@link editor}
   */
  getScopeSupport: (editor: TextEditor, scopeType: ScopeType) => ScopeSupport;

  /**
   * Determine the level of support for the iteration scope of {@link scopeType}
   * in {@link editor}, as determined by its language id.
   * @param editor The editor to check
   * @param scopeType The scope type to check
   * @returns The level of support for the iteration scope of {@link scopeType}
   * in {@link editor}
   */
  getIterationScopeSupport: (
    editor: TextEditor,
    scopeType: ScopeType,
  ) => ScopeSupport;

  /**
   * Registers a callback to be run when the scope support changes for the active
   * editor.  The callback will be run immediately once with the current support
   * levels for the active editor.
   *
   * Note that this watcher could be expensive, because it runs all the scope
   * handlers for the active editor every time the content of the active editor
   * changes. If you only need info about the available scopes, including their
   * spoken forms, you should use {@link onDidChangeScopeInfo} instead.
   * @param callback The callback to run when the scope support changes
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeSupport: (callback: ScopeSupportEventCallback) => Disposable;

  /**
   * Registers a callback to be run when the scope info changes.  The callback
   * will be run immediately once with the current scope info.
   *
   * Includes information about the available scopes, including their custom
   * spoken forms, if available. Note that even custom regex scopes will be
   * available, as reported to the engine by Talon.
   * @param callback The callback to run when the scope support changes
   * @returns A {@link Disposable} which will stop the callback from running
   */
  onDidChangeScopeInfo(callback: ScopeTypeInfoEventCallback): Disposable;

  /**
   * Get info about {@link scopeType}, including its custom spoken form, if
   * available.
   * @param editor The editor to check
   * @param scopeType The scope type to check
   * @returns Info about {@link scopeType}
   */
  getScopeInfo: (scopeType: ScopeType) => ScopeTypeInfo;
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

export type ScopeChangeEventCallback = (
  editor: TextEditor,
  scopeRanges: ScopeRanges[],
) => void;

export type IterationScopeChangeEventCallback = (
  editor: TextEditor,
  scopeRanges: IterationScopeRanges[],
) => void;

export interface ScopeSupportInfo extends ScopeTypeInfo {
  support: ScopeSupport;
  iterationScopeSupport: ScopeSupport;
}

export type ScopeSupportEventCallback = (
  scopeSupportInfos: ScopeSupportInfo[],
) => void;

export interface ScopeTypeInfo {
  scopeType: ScopeType;
  spokenForm: SpokenForm;
  humanReadableName: string;
  isLanguageSpecific: boolean;
}

export type ScopeTypeInfoEventCallback = (scopeInfos: ScopeTypeInfo[]) => void;

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
  removalRange: Range;
  removalHighlightRange: GeneralizedRange;
  leadingDelimiter: TargetRanges | undefined;
  trailingDelimiter: TargetRanges | undefined;
  interior: TargetRanges[] | undefined;
  boundary: TargetRanges[] | undefined;
  insertionDelimiter: string;
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

export enum ScopeSupport {
  supportedAndPresentInEditor,
  supportedButNotPresentInEditor,
  supportedLegacy,
  unsupported,
}
