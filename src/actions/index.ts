import { ActionRecord, Graph } from "../typings/Types";
import Clear from "./Clear";
import { Cut, Copy, Paste } from "./CutCopyPaste";
import Delete from "./Delete";
import ExtractVariable from "./ExtractVariable";
import { Fold, Unfold } from "./Fold";
import { EditNewLineAbove, EditNewLineBelow } from "./EditNewLine";
import {
  SetSelection,
  SetSelectionBefore,
  SetSelectionAfter,
} from "./SetSelection";
import Wrap from "./Wrap";
import { ScrollToTop, ScrollToCenter, ScrollToBottom } from "./Scroll";
import { IndentLines, OutdentLines } from "./Indent";
import { CommentLines } from "./Comment";
import { Bring, Move, Swap } from "./BringMoveSwap";
import {
  InsertEmptyLineAbove,
  InsertEmptyLineBelow,
  InsertEmptyLinesAround,
} from "./InsertEmptyLines";
import GetText from "./GetText";
import { FindInFiles } from "./Find";
import Replace from "./Replace";
import { CopyLinesUp, CopyLinesDown } from "./CopyLines";
import SetBreakpoint from "./SetBreakpoint";
import { Sort, Reverse } from "./Sort";
import Call from "./Call";
import WrapWithSnippet from "./WrapWithSnippet";
import Deselect from "./Deselect";
import Rewrap from "./Rewrap";
import ExecuteCommand from "./ExecuteCommand";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  callAsFunction = new Call(this.graph);
  clearAndSetSelection = new Clear(this.graph);
  copyToClipboard = new Copy(this.graph);
  cutToClipboard = new Cut(this.graph);
  editNewLineAfter = new EditNewLineBelow(this.graph);
  editNewLineBefore = new EditNewLineAbove(this.graph);
  executeCommand = new ExecuteCommand(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  findInWorkspace = new FindInFiles(this.graph);
  foldRegion = new Fold(this.graph);
  getText = new GetText(this.graph);
  indentLine = new IndentLines(this.graph);
  insertCopyAfter = new CopyLinesDown(this.graph);
  insertCopyBefore = new CopyLinesUp(this.graph);
  insertEmptyLineAfter = new InsertEmptyLineBelow(this.graph);
  insertEmptyLineBefore = new InsertEmptyLineAbove(this.graph);
  insertEmptyLinesAround = new InsertEmptyLinesAround(this.graph);
  moveToTarget = new Move(this.graph);
  outdentLine = new OutdentLines(this.graph);
  pasteFromClipboard = new Paste(this.graph);
  remove = new Delete(this.graph);
  deselect = new Deselect(this.graph);
  replace = new Replace(this.graph);
  replaceWithTarget = new Bring(this.graph);
  reverseTargets = new Reverse(this.graph);
  rewrapWithPairedDelimiter = new Rewrap(this.graph);
  scrollToBottom = new ScrollToBottom(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  sortTargets = new Sort(this.graph);
  swapTargets = new Swap(this.graph);
  toggleLineBreakpoint = new SetBreakpoint(this.graph);
  toggleLineComment = new CommentLines(this.graph);
  unfoldRegion = new Unfold(this.graph);
  wrapWithPairedDelimiter = new Wrap(this.graph);
  wrapWithSnippet = new WrapWithSnippet(this.graph);
}

export default Actions;
