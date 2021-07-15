import { Graph } from "../Types";
import CommandAction from "../CommandAction";

export class Indent extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.indentLines");
  }
}

export class Outdent extends CommandAction {
  constructor(graph: Graph) {
    super(graph, "editor.action.outdentLines");
  }
}
