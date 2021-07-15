import { Action, ActionRecord, Graph } from "../Types";
import Clear from "./clear";
import Copy from "./copy";
import Cut from "./cut";
import Delete from "./delete";
import ExtractVariable from "./extractVariable";
import { Fold, Unfold } from "./fold";
import { InsertLineBefore, InsertLineAfter } from "./InsertLine";
import {
  SetSelection,
  SetSelectionBefore,
  SetSelectionAfter,
} from "./setSelection";
import Swap from "./swap";
import Use from "./use";
import Wrap from "./wrap";
import { ScrollToTop, ScrollToCenter, ScrollToBottom } from "./Scroll";
import { Indent, Outdent } from "./Indent";
import { CommentLine } from "./Comment";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  clear = new Clear(this.graph);
  commentLine = new CommentLine(this.graph);
  copy = new Copy(this.graph);
  cut = new Cut(this.graph);
  delete = new Delete(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  fold = new Fold(this.graph);
  indent = new Indent(this.graph);
  insertLineBefore = new InsertLineBefore(this.graph);
  insertLineAfter = new InsertLineAfter(this.graph);
  outdent = new Outdent(this.graph);
  paste: Action = {
    run: async ([targets]) => {
      throw new Error("Not implemented");
    },
    targetPreferences: [{ position: "after", insideOutsideType: "outside" }],
  };
  scrollToBottom = new ScrollToBottom(this.graph);
  scrollToCenter = new ScrollToCenter(this.graph);
  scrollToTop = new ScrollToTop(this.graph);
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  swap = new Swap(this.graph);
  use = new Use(this.graph);
  unfold = new Unfold(this.graph);
  wrap = new Wrap(this.graph);
}

export default Actions;
