import { Range, Selection, TextEditor } from "vscode";
import { EditWithRangeUpdater } from "./Types";

export interface EditNewCommandContext {
  type: "command";
  command: string;
}
export interface EditNewDelimiterContext {
  type: "delimiter";
  delimiter: string;
}

export type EditNewContext = EditNewCommandContext | EditNewDelimiterContext;

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

  /** If true this target is weak and can be transformed/upgraded */
  readonly isWeak: boolean;

  /** If true this target is a raw selection and its insertion delimiter should not be used on bring action */
  readonly isRaw: boolean;

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
  getRemovalHighlightRange(): Range | undefined;
  getEditNewContext(isBefore: boolean): EditNewContext;
  withThatTarget(thatTarget: Target): Target;
  withContentRange(contentRange: Range): Target;
  createContinuousRangeTarget(
    isReversed: boolean,
    endTarget: Target,
    includeStart: boolean,
    includeEnd: boolean
  ): Target;
  /** Constructs change/insertion edit. Adds delimiter before/after if needed */
  constructChangeEdit(text: string): EditWithRangeUpdater;
  /** Constructs removal edit */
  constructRemovalEdit(): EditWithRangeUpdater;
  isEqual(target: Target): boolean;
}
