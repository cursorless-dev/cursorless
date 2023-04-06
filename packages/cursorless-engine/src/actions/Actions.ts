import { Graph } from "../typings/Graph";
import { ActionRecord } from "./actions.types";
import {
  ToggleLineComment,
  ExtractVariable,
  IndentLine,
  OutdentLine,
  Rename,
  RevealDefinition,
  RevealTypeDefinition,
  ShowDebugHover,
  ShowHover,
  ShowQuickFix,
  ShowReferences,
  CopyToClipboard,
  Fold,
  Unfold,
} from "./SimpleIdeCommandActions";
import { Bring, Move, Swap } from "./BringMoveSwap";
import Call from "./Call";
import Clear from "./Clear";
import { CutToClipboard } from "./CutToClipboard";
import Deselect from "./Deselect";
import { EditNew, EditNewAfter, EditNewBefore } from "./EditNew";
import ExecuteCommand from "./ExecuteCommand";
import { FindInWorkspace } from "./Find";
import FollowLink from "./FollowLink";
import GenerateSnippet from "./GenerateSnippet";
import GetText from "./GetText";
import Highlight from "./Highlight";
import {
  CopyContentAfter as InsertCopyAfter,
  CopyContentBefore as InsertCopyBefore,
} from "./InsertCopy";
import {
  InsertEmptyLineAbove as InsertEmptyLineBefore,
  InsertEmptyLineBelow as InsertEmptyLineAfter,
  InsertEmptyLinesAround,
} from "./InsertEmptyLines";
import InsertSnippet from "./InsertSnippet";
import { PasteFromClipboard } from "./PasteFromClipboard";
import Remove from "./Remove";
import Replace from "./Replace";
import Rewrap from "./Rewrap";
import { ScrollToBottom, ScrollToCenter, ScrollToTop } from "./Scroll";
import {
  SetSelection,
  SetSelectionAfter,
  SetSelectionBefore,
} from "./SetSelection";
import { Random, Reverse, Sort } from "./Sort";
import ToggleBreakpoint from "./ToggleBreakpoint";
import Wrap from "./Wrap";
import WrapWithSnippet from "./WrapWithSnippet";
import { Snippets } from "../core/Snippets";

/**
 * Keeps a map from action names to objects that implement the given action
 */
export class Actions implements ActionRecord {
  constructor(private graph: Graph, private snippets: Snippets) {}

  callAsFunction = new Call(this);
  clearAndSetSelection = new Clear(this);
  copyToClipboard = new CopyToClipboard(this.graph);
  cutToClipboard = new CutToClipboard(this);
  deselect = new Deselect(this.graph);
  editNew = new EditNew(this.graph, this);
  editNewLineAfter = new EditNewAfter(this.graph, this);
  editNewLineBefore = new EditNewBefore(this.graph, this);
  executeCommand = new ExecuteCommand(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  findInWorkspace = new FindInWorkspace(this);
  foldRegion = new Fold(this.graph);
  followLink = new FollowLink(this);
  generateSnippet = new GenerateSnippet(this.graph);
  getText = new GetText(this.graph);
  highlight = new Highlight(this.graph);
  indentLine = new IndentLine(this.graph);
  insertCopyAfter = new InsertCopyAfter(this.graph);
  insertCopyBefore = new InsertCopyBefore(this.graph);
  insertEmptyLineAfter = new InsertEmptyLineAfter(this.graph);
  insertEmptyLineBefore = new InsertEmptyLineBefore(this.graph);
  insertEmptyLinesAround = new InsertEmptyLinesAround(this.graph);
  insertSnippet = new InsertSnippet(this.graph, this.snippets, this);
  moveToTarget = new Move(this.graph);
  outdentLine = new OutdentLine(this.graph);
  pasteFromClipboard = new PasteFromClipboard(this.graph, this);
  randomizeTargets = new Random(this);
  remove = new Remove(this.graph);
  rename = new Rename(this.graph);
  replace = new Replace(this.graph);
  replaceWithTarget = new Bring(this.graph);
  revealDefinition = new RevealDefinition(this.graph);
  revealTypeDefinition = new RevealTypeDefinition(this.graph);
  reverseTargets = new Reverse(this);
  rewrapWithPairedDelimiter = new Rewrap(this.graph);
  scrollToBottom = new ScrollToBottom(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  showDebugHover = new ShowDebugHover(this.graph);
  showHover = new ShowHover(this.graph);
  showQuickFix = new ShowQuickFix(this.graph);
  showReferences = new ShowReferences(this.graph);
  sortTargets = new Sort(this);
  swapTargets = new Swap(this.graph);
  toggleLineBreakpoint = new ToggleBreakpoint(this.graph);
  toggleLineComment = new ToggleLineComment(this.graph);
  unfoldRegion = new Unfold(this.graph);
  wrapWithPairedDelimiter = new Wrap(this.graph);
  wrapWithSnippet = new WrapWithSnippet(this.graph, this.snippets);
}
