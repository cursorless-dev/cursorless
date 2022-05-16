import { Graph } from "../typings/Types";
import { ActionRecord } from "./actions.types";
import Call from "./Call";
import Clear from "./Clear";
import { CommentLines } from "./Comment";
import { CopyLinesDown, CopyLinesUp } from "./CopyLines";
import { Copy, Cut, Paste } from "./CutCopyPaste";
import Deselect from "./Deselect";
import { EditNewLineAbove, EditNewLineBelow } from "./EditNewLine";
import ExecuteCommand from "./ExecuteCommand";
import ExtractVariable from "./ExtractVariable";
import { FindInFiles } from "./Find";
import { Fold, Unfold } from "./Fold";
import FollowLink from "./FollowLink";
import GetText from "./GetText";
import Highlight from "./Highlight";
import { IndentLines, OutdentLines } from "./Indent";
import {
  InsertEmptyLineAbove,
  InsertEmptyLineBelow,
  InsertEmptyLinesAround,
} from "./InsertEmptyLines";
import Remove from "./Remove";
import Replace from "./Replace";
import { ScrollToBottom, ScrollToCenter, ScrollToTop } from "./Scroll";
import {
  SetSelection,
  SetSelectionAfter,
  SetSelectionBefore,
} from "./SetSelection";
import { Random, Reverse, Sort } from "./Sort";
import ToggleBreakpoint from "./ToggleBreakpoint";
import Wrap from "./Wrap";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  // wrapWithSnippet = new WrapWithSnippet(this.graph);
  wrapWithPairedDelimiter = new Wrap(this.graph);
  unfoldRegion = new Unfold(this.graph);
  toggleLineComment = new CommentLines(this.graph);
  toggleLineBreakpoint = new ToggleBreakpoint(this.graph);
  // swapTargets = new Swap(this.graph);
  sortTargets = new Sort(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelection = new SetSelection(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToBottom = new ScrollToBottom(this.graph);
  // rewrapWithPairedDelimiter = new Rewrap(this.graph);
  reverseTargets = new Reverse(this.graph);
  // replaceWithTarget = new Bring(this.graph);
  replace = new Replace(this.graph);
  remove = new Remove(this.graph);
  randomizeTargets = new Random(this.graph);
  pasteFromClipboard = new Paste(this.graph);
  outdentLine = new OutdentLines(this.graph);
  // moveToTarget = new Move(this.graph);
  insertEmptyLinesAround = new InsertEmptyLinesAround(this.graph);
  insertEmptyLineBefore = new InsertEmptyLineAbove(this.graph);
  insertEmptyLineAfter = new InsertEmptyLineBelow(this.graph);
  insertCopyBefore = new CopyLinesUp(this.graph);
  insertCopyAfter = new CopyLinesDown(this.graph);
  indentLine = new IndentLines(this.graph);
  highlight = new Highlight(this.graph);
  getText = new GetText(this.graph);
  followLink = new FollowLink(this.graph);
  foldRegion = new Fold(this.graph);
  findInWorkspace = new FindInFiles(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  executeCommand = new ExecuteCommand(this.graph);
  editNewLineBefore = new EditNewLineAbove(this.graph);
  editNewLineAfter = new EditNewLineBelow(this.graph);
  deselect = new Deselect(this.graph);
  cutToClipboard = new Cut(this.graph);
  copyToClipboard = new Copy(this.graph);
  clearAndSetSelection = new Clear(this.graph);
  callAsFunction = new Call(this.graph);
}

export default Actions;
