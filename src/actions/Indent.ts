import { Graph } from "../typings/Types";
import CommandAction from "./CommandAction";

export class IndentLines extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.indentLines");
  }
}

export class OutdentLines extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.outdentLines");
  }
}
