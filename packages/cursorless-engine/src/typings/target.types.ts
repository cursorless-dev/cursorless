// NB: We import `Target` below just so that @link below resolves.  Once one of
// the following issues are fixed, we can either remove the above line or
// switch to `{import("foo")}` syntax in the `{@link}` tag.
// - https://github.com/microsoft/TypeScript/issues/43869
// - https://github.com/microsoft/TypeScript/issues/43950
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type { ModifyIfUntypedStage } from "../processTargets/modifiers/ConditionalModifierStages";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
import type {
  InsertionMode,
  Range,
  Selection,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
  Snippet,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
  SnippetVariable,
  TargetPlainObject,
  TextEditor,
} from "@cursorless/common";
import type {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
  ScopeTypeTarget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
  TokenTarget,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, unused-imports/no-unused-imports
  UntypedTarget,
} from "../processTargets/targets";
import type { EditWithRangeUpdater } from "./Types";

export type EditNewActionType = "edit" | "insertLineAfter";

export interface Target {
  /** The text editor used for all ranges */
  readonly editor: TextEditor;

  /** If true active is before anchor */
  readonly isReversed: boolean;

  /** The range of the content */
  readonly contentRange: Range;

  /** If this selection has a delimiter use it for inserting before or after the target. For example, new line for a line or paragraph and comma for a list or argument */
  readonly insertionDelimiter: string;

  /** If true this target should be treated as a line */
  readonly isLine: boolean;

  /** If true this target should be treated as a token */
  readonly isToken: boolean;

  /** If true this target should be treated as a word */
  readonly isWord: boolean;

  /**
   * If `true`, then this target has an explicit scope type, and so should never
   * be automatically expanded to a containing scope.
   *
   * Examples of targets that have explicit scopes are {@link ScopeTypeTarget}
   * (eg `"funk"`), {@link TokenTarget} (eg `"token"`), etc.
   *
   * As of writing this comment, the only target type that doesn't have an
   * explicit scope type is {@link UntypedTarget}, which can be constructed by
   *
   * - using a decorated mark (`"air"`), or
   * - using any cursor mark (`"this"`), or
   * - using a range between decorated marks or cursor marks (eg `"past air"` or
   *   `"air past bat"`), or
   * - using any `"that"` mark (eg after saying `"copy air"`), though this
   *   final behaviour will change with #466.
   *
   * The primary consumer of this attribute is {@link ModifyIfUntypedStage},
   * which is used in the following situations to automatically expand to a
   * particular scope type when `hasExplicitScopeType` is `false`:
   *
   * - To expand to `"line"` for `"pour"`, `"clone"`, and `"breakpoint"`
   * - To expand to `"token"` for `"leading"` and `"trailing"`
   * - To expand to nearest containing pair for `"inside"`, `"bounds"`, and
   *   `"rewrap"`
   * - To expand to {@link SnippetVariable.wrapperScopeType} for snippet
   *   wrapping
   * - To expand to {@link Snippet.insertionScopeTypes} for snippet insertion
   *
   * For example, when the user says `"pour air"`, the
   * {@link DecoratedSymbolStage} will return an {@link UntypedTarget}, which
   * has `hasExplicitScopeType=false`, so `"pour"` will expand to the line
   * containining the air token and insert a newline after it.
   */
  readonly hasExplicitScopeType: boolean;

  /**
   * If `true`, then this target has an explicit range.  This attribute is used
   * by `"every"` to determine whether to return all scopes in the iteration
   * scope or just the ones that overlap with the given target's
   * {@link contentRange}.
   *
   * Most targets have explicit ranges.  As of writing this comment, the only
   * targets that don't are as follows:
   *
   * - a decorated mark (`"air"`), or
   * - an empty cursor mark (`"this"` with an empty selection), or
   * - an empty `"that"` mark (eg after saying `"chuck air"`).
   *
   * For example, when the user says `"change every state air"`, we clear every
   * statement in the function, but `"change every state this"` with a non-empty
   * selection will only target statements overlapping the cursor.
   */
  readonly hasExplicitRange: boolean;

  /** If true this target is a raw selection and its insertion delimiter should not be used on bring action */
  readonly isRaw: boolean;

  /**
   * If `true`, this target was not explicitly spoken by the user. For example:
   *
   * - The implicit destination in the command `"bring air"`
   * - The implicit anchor in the range `"take past air"`
   */
  readonly isImplicit: boolean;

  /** If true this target is a notebook cell */
  readonly isNotebookCell: boolean;

  /** The text contained in the content range */
  readonly contentText: string;

  /** The content range and is reversed turned into a selection */
  readonly contentSelection: Selection;

  /** Internal target that should be used for the that mark */
  readonly thatTarget: Target;

  getInteriorStrict(): Target[];
  getBoundaryStrict(): Target[];
  /** The range of the delimiter before the content selection */
  getLeadingDelimiterTarget(): Target | undefined;
  /** The range of the delimiter after the content selection */
  getTrailingDelimiterTarget(): Target | undefined;
  getRemovalRange(): Range;

  /**
   * The range that should be highlighted when the target is removed. Note that
   * we can't just use `getRemovalRange()`, because when we highlight a line for
   * removal, we don't know which line to highlight just based on the removal
   * range.
   *
   * For example, assume that the document, represented as a string, is `"\n"`.
   * This corresponds to a document with two empty lines. If we say `"chuck
   * line"` on either line, the removal range will be the entire document, but
   * we want to highlight the line that they were on when they said `"chuck
   * line"`, as that is logically the line they've deleted.
   */
  getRemovalHighlightRange(): Range;
  withThatTarget(thatTarget: Target): Target;
  withContentRange(contentRange: Range): Target;
  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean,
  ): Target;
  /** Constructs removal edit */
  constructRemovalEdit(): EditWithRangeUpdater;
  isEqual(target: Target): boolean;
  /**
   * Construct a destination  with the given insertion mode.
   * @param position The insertion modes to use, eg `before`, `after`, `to`
   */
  toDestination(insertionMode: InsertionMode): Destination;
  /**
   * Constructs an object suitable for serialization by json. This is used to
   * capture targets for testing and recording test cases.
   *
   * @returns A plain object that can be json serialized
   */
  toPlainObject(): TargetPlainObject;
}

/**
 * A destination is a wrapper around a target that can be used for inserting new
 * text. It represents things like "after funk", "before air", "to bat", etc. in
 * commands like "bring funk air to bat", "paste after line", etc.  Destinations
 * are also created implicitly for actions like "drink" and "pour".
 */
export interface Destination {
  readonly insertionMode: InsertionMode;
  readonly editor: TextEditor;
  readonly target: Target;
  readonly contentRange: Range;
  readonly contentSelection: Selection;
  readonly isRaw: boolean;
  readonly insertionDelimiter: string;
  withTarget(target: Target): Destination;
  getEditNewActionType(): EditNewActionType;
  /** Constructs change/insertion edit. Adds delimiter before/after if needed */
  constructChangeEdit(text: string): EditWithRangeUpdater;
}
