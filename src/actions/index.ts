import { Action, ActionRecord, Graph } from "../Types";
import Clear from "./clear";
import Copy from "./copy";
import Cut from "./cut";
import Delete from "./delete";
import ExtractVariable from "./extractVariable";
import { Fold, Unfold } from "./fold";
import {
  SetSelection,
  SetSelectionBefore,
  SetSelectionAfter,
} from "./setSelection";
import Swap from "./swap";
import Use from "./use";
import Wrap from "./wrap";

class Actions implements ActionRecord {
  constructor(private graph: Graph) {}

  clear = new Clear(this.graph);
  copy = new Copy(this.graph);
  cut = new Cut(this.graph);
  delete = new Delete(this.graph);
  extractVariable = new ExtractVariable(this.graph);
  fold = new Fold(this.graph);
  paste: Action = {
    run: async ([targets]) => {
      throw new Error("Not implemented");
    },
    targetPreferences: [{ position: "after", insideOutsideType: "outside" }],
  };
  setSelection = new SetSelection(this.graph);
  setSelectionAfter = new SetSelectionAfter(this.graph);
  setSelectionBefore = new SetSelectionBefore(this.graph);
  swap = new Swap(this.graph);
  use = new Use(this.graph);
  unfold = new Unfold(this.graph);
  wrap = new Wrap(this.graph);
}

export default Actions;
