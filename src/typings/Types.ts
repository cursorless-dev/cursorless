import * as vscode from "vscode";
import { ExtensionContext, Location } from "vscode";
import { SyntaxNode } from "web-tree-sitter";
import { ActionRecord } from "../actions/actions.types";
import Debug from "../core/Debug";
import Decorations from "../core/Decorations";
import { EditStyles } from "../core/editStyles";
import FontMeasurements from "../core/FontMeasurements";
import HatTokenMap from "../core/HatTokenMap";
import { ReadOnlyHatMap } from "../core/IndividualHatMap";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ModifierStage } from "../processTargets/PipelineStages.types";
import { TestCaseRecorder } from "../testUtil/TestCaseRecorder";
import { CommandServerApi } from "../util/getExtensionApi";
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
   * Modifier stages contributed by the action. These stages will run at the
   * end of the pipeline, but before the final positional stage, if there is one
   */
  actionStages: ModifierStage[];
  currentSelections: SelectionWithEditor[];
  currentEditor: vscode.TextEditor | undefined;
  hatTokenMap: ReadOnlyHatMap;
  thatMark: SelectionWithEditor[];
  sourceMark: SelectionWithEditor[];
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
   * Selection used for outside selection
   */
  removalRange?: vscode.Range;

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
  updateRange: (range: vscode.Range) => vscode.Range;
}

export type TextFormatterName = "camelCase" | "pascalCase" | "snakeCase";
