import { Graph } from "../typings/Types";
import CommandAction from "./CommandAction";

export class CommentLines extends CommandAction {
  constructor(graph: Graph) {
    super(graph, { command: "editor.action.commentLine" });
  }
}
