import { ActionRecord, Graph } from "../typings/Types";
import Clear from "./Clear";
import Deselect from "./Deselect";
import GetText from "./GetText";
import Highlight from "./Highlight";
import Remove from "./Remove";
import {
  SetSelection,
  SetSelectionAfter,
  SetSelectionBefore,
} from "./SetSelection";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  // callAsFunction = new Call(this.graph);
  clearAndSetSelection = new Clear(this.graph);
  // copyToClipboard = new Copy(this.graph);
  // cutToClipboard = new Cut(this.graph);
  // editNewLineAfter = new EditNewLineBelow(this.graph);
  // editNewLineBefore = new EditNewLineAbove(this.graph);
  // executeCommand = new ExecuteCommand(this.graph);
  // extractVariable = new ExtractVariable(this.graph);
  // findInWorkspace = new FindInFiles(this.graph);
  // foldRegion = new Fold(this.graph);
  // followLink = new FollowLink(this.graph);
  getText = new GetText(this.graph);
  highlight = new Highlight(this.graph);
  // indentLine = new IndentLines(this.graph);
  // insertCopyAfter = new CopyLinesDown(this.graph);
  // insertCopyBefore = new CopyLinesUp(this.graph);
  // insertEmptyLineAfter = new InsertEmptyLineBelow(this.graph);
  // insertEmptyLineBefore = new InsertEmptyLineAbove(this.graph);
  // insertEmptyLinesAround = new InsertEmptyLinesAround(this.graph);
  // moveToTarget = new Move(this.graph);
  // outdentLine = new OutdentLines(this.graph);
  // pasteFromClipboard = new Paste(this.graph);
  remove = new Remove(this.graph);
  deselect = new Deselect(this.graph);
  // replace = new Replace(this.graph);
  // replaceWithTarget = new Bring(this.graph);
  // randomizeTargets = new Random(this.graph);
  // reverseTargets = new Reverse(this.graph);
  // rewrapWithPairedDelimiter = new Rewrap(this.graph);
  // scrollToBottom = new ScrollToBottom(this.graph);
  // scrollToCenter = new ScrollToCenter(this.graph);
  // scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  // sortTargets = new Sort(this.graph);
  // swapTargets = new Swap(this.graph);
  // toggleLineBreakpoint = new SetBreakpoint(this.graph);
  // toggleLineComment = new CommentLines(this.graph);
  // unfoldRegion = new Unfold(this.graph);
  // wrapWithPairedDelimiter = new Wrap(this.graph);
  // wrapWithSnippet = new WrapWithSnippet(this.graph);
  //
}

export default Actions;
