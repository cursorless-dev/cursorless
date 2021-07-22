import { Action, ActionRecord, Graph } from "../Types";
import Clear from "./clear";
import Copy from "./copy";
import Cut from "./cut";
import Delete from "./delete";
import ExtractVariable from "./extractVariable";
import { Fold, Unfold } from "./fold";
import { EditNewLineAbove, EditNewLineBelow } from "./EditNewLine";
import {
  SetSelection,
  SetSelectionBefore,
  SetSelectionAfter,
} from "./setSelection";
import Wrap from "./wrap";
import { ScrollToTop, ScrollToCenter, ScrollToBottom } from "./Scroll";
import { IndentLines, OutdentLines } from "./Indent";
import { CommentLines } from "./Comment";
import Paste from "./Paste";
import { Bring, Move, Swap } from "./BringMoveSwap";
import {
  InsertEmptyLineAbove,
  InsertEmptyLineBelow,
  InsertEmptyLinesAround,
} from "./InsertEmptyLines";
import GetText from "./GetText";
import { FindInFiles } from "./Find";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  // TODO NB Remove when user had time to migrate to new talon code
  use = new Bring(this.graph);
  insertLineBefore = new EditNewLineAbove(this.graph);
  insertLineAfter = new EditNewLineBelow(this.graph);

  bring = new Bring(this.graph);
  clear = new Clear(this.graph);
  commentLines = new CommentLines(this.graph);
  copy = new Copy(this.graph);
  cut = new Cut(this.graph);
  delete = new Delete(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  editNewLineAbove = new EditNewLineAbove(this.graph);
  editNewLineBelow = new EditNewLineBelow(this.graph);
  findInFiles = new FindInFiles(this.graph);
  fold = new Fold(this.graph);
  getText = new GetText(this.graph);
  insertEmptyLineAbove = new InsertEmptyLineAbove(this.graph);
  insertEmptyLinesAround = new InsertEmptyLinesAround(this.graph);
  insertEmptyLineBelow = new InsertEmptyLineBelow(this.graph);
  indentLines = new IndentLines(this.graph);
  move = new Move(this.graph);
  outdentLines = new OutdentLines(this.graph);
  paste = new Paste(this.graph);
  scrollToBottom = new ScrollToBottom(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  swap = new Swap(this.graph);
  unfold = new Unfold(this.graph);
  wrap = new Wrap(this.graph);
}

export default Actions;
