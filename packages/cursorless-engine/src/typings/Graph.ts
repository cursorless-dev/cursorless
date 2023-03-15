import { CommandServerApi, Range, TextDocument } from "@cursorless/common";
import type { SyntaxNode } from "web-tree-sitter";
import { ActionRecord } from "../actions/actions.types";
import Debug from "../core/Debug";
import HatTokenMapImpl from "../core/HatTokenMapImpl";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { TestCaseRecorder } from "../testCaseRecorder/TestCaseRecorder";

export interface Graph {
  /**
   * Keeps a map from action names to objects that implement the given action
   */
  readonly actions: ActionRecord;

  /**
   * Maps from (hatStyle, character) pairs to tokens
   */
  readonly hatTokenMap: HatTokenMapImpl;

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
}
