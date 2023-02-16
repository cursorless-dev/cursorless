import type {
  Range,
  Selection,
  TextEditor,
  TextDocument,
} from "@cursorless/common";
import { SyntaxNode } from "web-tree-sitter";
import { ActionRecord } from "../actions/actions.types";
import Debug from "../core/Debug";
import HatTokenMap from "../core/HatTokenMap";
import { ReadOnlyHatMap } from "../core/IndividualHatMap";
import { Snippets } from "../core/Snippets";
import StatusBarItem from "../core/StatusBarItem";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import type { CommandServerApi } from "../../vscode-common/getExtensionApi";
import KeyboardCommands from "../../cursorless-vscode-core/keyboard/KeyboardCommands";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { TestCaseRecorder } from "../testCaseRecorder/TestCaseRecorder";
import { Target } from "./target.types";
import { RangeOffsets } from "./updateSelections";

/**
 * A token within a text editor
 */
export interface Token {
  editor: TextEditor;
  range: Range;
  offsets: RangeOffsets;
  text: string;
}

export interface ProcessedTargetsContext {
  /**
   * Modifier stages contributed by the action that should run before the final
   * positional stage, if there is one
   */
  actionPrePositionStages: ModifierStage[];
  /**
   * Modifier stages contributed by the action that should run at the end of the
   * modifier pipeline
   */
  actionFinalStages: ModifierStage[];
  currentSelections: SelectionWithEditor[];
  currentEditor: TextEditor | undefined;
  hatTokenMap: ReadOnlyHatMap;
  thatMark: Target[];
  sourceMark: Target[];
  getNodeAtLocation: (document: TextDocument, range: Range) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: Selection;
  editor: TextEditor;
}

export interface RangeWithEditor {
  range: Range;
  editor: TextEditor;
}

export interface SelectionContext {
  containingListDelimiter?: string;

  /**
   * Selection used for removal
   */
  removalRange?: Range;

  /**
   * The range used for the interior
   */
  interiorRange?: Range;

  /**
   * The range of the delimiter before the selection
   */
  leadingDelimiterRange?: Range;

  /**
   * The range of the delimiter after the selection
   */
  trailingDelimiterRange?: Range;
}

export type SelectionWithEditorWithContext = {
  selection: SelectionWithEditor;
  context: SelectionContext;
};

export interface SelectionWithContext {
  selection: Selection;
  context: SelectionContext;
}

export interface Graph {
  /**
   * Keeps a map from action names to objects that implement the given action
   */
  readonly actions: ActionRecord;

  /**
   * Maps from (hatStyle, character) pairs to tokens
   */
  readonly hatTokenMap: HatTokenMap;

  /**
   * Keeps a merged list of all user-contributed, core, and
   * extension-contributed cursorless snippets
   */
  readonly snippets: Snippets;

  /**
   * This component can be used to register a list of ranges to keep up to date
   * as the document changes
   */
  readonly rangeUpdater: RangeUpdater;

  /**
   * API object for interacting with the command server, if it exists
   */
  readonly commandServerApi: CommandServerApi | null;

  /**
   * Function to access nodes in the tree sitter.
   */
  readonly getNodeAtLocation: (
    document: TextDocument,
    range: Range,
  ) => SyntaxNode;

  /**
   * Debug logger
   */
  readonly debug: Debug;

  /**
   * Used for recording test cases
   */
  readonly testCaseRecorder: TestCaseRecorder;

  /**
   * Creates a VSCode status bar item
   */
  readonly statusBarItem: StatusBarItem;

  /**
   * Set of simplified commands that can be easily mapped to keyboard shortcuts.
   */
  readonly keyboardCommands: KeyboardCommands;
}

export type NodeMatcherValue = {
  node: SyntaxNode;
  selection: SelectionWithContext;
};

export type NodeMatcherAlternative = NodeMatcher | string[] | string;

export type NodeMatcher = (
  selection: SelectionWithEditor,
  node: SyntaxNode,
) => NodeMatcherValue[] | null;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (
  node: SyntaxNode,
  selection?: Selection,
) => SyntaxNode | null;

/** Returns one or more selections for a given SyntaxNode */
export type SelectionExtractor = (
  editor: TextEditor,
  nodes: SyntaxNode,
) => SelectionWithContext;

/** Represent a single edit/change in the document */
export interface Edit {
  range: Range;
  text: string;

  /**
   * If this edit is an insertion, ie the range has zero length, then this
   * field can be set to `true` to indicate that any adjacent empty selection
   * should *not* be shifted to the right, as would normally happen with an
   * insertion. This is equivalent to the
   * [distinction](https://code.visualstudio.com/api/references/vscode-api#TextEditorEdit)
   * in a vscode edit builder between doing a replace with an empty range
   * versus doing an insert.
   */
  isReplace?: boolean;
}

export interface EditWithRangeUpdater extends Edit {
  /**
   * This function will be passed the resulting range containing {@link text}
   * after applying the edit, and should return a new range which excludes any
   * delimiters that were inserted.
   */
  updateRange: (range: Range) => Range;
}

export type TextFormatterName =
  | "camelCase"
  | "pascalCase"
  | "snakeCase"
  | "upperSnakeCase";
