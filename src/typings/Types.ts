import * as vscode from "vscode";
import { ExtensionContext, Location } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { ActionRecord } from "../actions/actions.types";
import Cheatsheet from "../core/Cheatsheet";
import Debug from "../core/Debug";
import Decorations from "../core/Decorations";
import { EditStyles } from "../core/editStyles";
import FontMeasurements from "../core/FontMeasurements";
import HatTokenMap from "../core/HatTokenMap";
import { ReadOnlyHatMap } from "../core/IndividualHatMap";
import { Snippets } from "../core/Snippets";
import StatusBarItem from "../core/StatusBarItem";
import { TokenGraphemeSplitter } from "../core/TokenGraphemeSplitter";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { IDE } from "../ide/ide.types";
import KeyboardCommands from "../keyboard/KeyboardCommands";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { TestCaseRecorder } from "../testUtil/TestCaseRecorder";
import { CommandServerApi } from "../util/getExtensionApi";
import { Target } from "./target.types";
import { FullRangeInfo } from "./updateSelections";

/**
 * A token within a text editor, including the current display line of the token
 */
export interface Token extends FullRangeInfo {
  editor: vscode.TextEditor;
  displayLine: number;
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
  currentEditor: vscode.TextEditor | undefined;
  hatTokenMap: ReadOnlyHatMap;
  thatMark: Target[];
  sourceMark: Target[];
  getNodeAtLocation: (location: Location) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: vscode.Selection;
  editor: vscode.TextEditor;
}

export interface RangeWithEditor {
  range: vscode.Range;
  editor: vscode.TextEditor;
}

export interface SelectionContext {
  containingListDelimiter?: string;

  /**
   * Selection used for removal
   */
  removalRange?: vscode.Range;

  /**
   * The range used for the interior
   */
  interiorRange?: vscode.Range;

  /**
   * The range of the delimiter before the selection
   */
  leadingDelimiterRange?: vscode.Range;

  /**
   * The range of the delimiter after the selection
   */
  trailingDelimiterRange?: vscode.Range;
}

export type SelectionWithEditorWithContext = {
  selection: SelectionWithEditor;
  context: SelectionContext;
};

export interface SelectionWithContext {
  selection: vscode.Selection;
  context: SelectionContext;
}

export interface Graph {
  /**
   * Keeps a map from action names to objects that implement the given action
   */
  readonly actions: ActionRecord;

  /**
   * Maintains decorations that can be used to visually indicate to the user
   * the targets of their actions.
   */
  readonly editStyles: EditStyles;

  /**
   * Maps from (hatStyle, character) pairs to tokens
   */
  readonly hatTokenMap: HatTokenMap;

  /**
   * The extension context passed in during extension activation
   */
  readonly extensionContext: ExtensionContext;

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
   * Responsible for all the hat styles
   */
  readonly decorations: Decorations;

  /**
   * Takes measurements of the user's font
   */
  readonly fontMeasurements: FontMeasurements;

  /**
   * API object for interacting with the command server, if it exists
   */
  readonly commandServerApi: CommandServerApi | null;

  /**
   * Function to access nodes in the tree sitter.
   */
  readonly getNodeAtLocation: (location: vscode.Location) => SyntaxNode;

  /**
   * Debug logger
   */
  readonly debug: Debug;

  /**
   * Used for recording test cases
   */
  readonly testCaseRecorder: TestCaseRecorder;

  /**
   * Used to display cheatsheet
   */
  readonly cheatsheet: Cheatsheet;

  /**
   * Creates a VSCode status bar item
   */
  readonly statusBarItem: StatusBarItem;

  /**
   * Used to split a token into a graphemes that can be used for a hat placement
   */
  readonly tokenGraphemeSplitter: TokenGraphemeSplitter;

  /**
   * Used to interact with the ide
   */
  readonly ide: IDE;

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
  node: SyntaxNode
) => NodeMatcherValue[] | null;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (
  node: SyntaxNode,
  selection?: vscode.Selection
) => SyntaxNode | null;

/** Returns one or more selections for a given SyntaxNode */
export type SelectionExtractor = (
  editor: vscode.TextEditor,
  nodes: SyntaxNode
) => SelectionWithContext;

/** Represent a single edit/change in the document */
export interface Edit {
  range: vscode.Range;
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
  updateRange: (range: vscode.Range) => vscode.Range;
}

export type TextFormatterName =
  | "camelCase"
  | "pascalCase"
  | "snakeCase"
  | "upperSnakeCase";

export interface TokenHatSplittingMode {
  /**
   * Whether to distinguished between uppercase and lower case letters for hat
   */
  preserveCase: boolean;

  /**
   * A list of characters whose accents should not be stripped. This can be
   * used, for example, if you would like to strip all accents except for those
   * of a few characters, which you can add to this string.
   */
  lettersToPreserve: string[];

  /**
   * A list of symbols that shouldn't be normalized by the token hat splitter.
   * Add any extra symbols here that you have added to your
   * <user.any_alphanumeric_key> capture.
   */
  symbolsToPreserve: string[];
}
