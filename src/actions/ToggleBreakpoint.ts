import * as vscode from "vscode";
import { URI } from "vscode-uri";
import { toVscodeRange } from "../ide/vscode/VscodeUtil";
import { containingLineIfUntypedStage } from "../processTargets/modifiers/commonContainingScopeIfUntypedStages";
import { EditableTarget } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";

function getBreakpoints(uri: URI, range: vscode.Range) {
  return vscode.debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof vscode.SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      breakpoint.location.range.intersection(range) != null,
  );
}

export default class ToggleBreakpoint implements Action {
  getFinalStages = () => [containingLineIfUntypedStage];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [
    EditableTarget[],
    EditableTarget[],
  ]): Promise<ActionReturnValue> {
    const thatTargets = targets.map(({ thatTarget }) => thatTarget);

    await this.graph.editStyles.displayPendingEditDecorations(
      thatTargets,
      this.graph.editStyles.referenced,
    );

    const toAdd: vscode.Breakpoint[] = [];
    const toRemove: vscode.Breakpoint[] = [];

    targets.forEach((target) => {
      let range = toVscodeRange(target.contentRange);
      // The action preference give us line content but line breakpoints are registered on character 0
      if (target.isLine) {
        range = range.with(range.start.with(undefined, 0), undefined);
      }
      const uri = target.editor.document.uri;
      const existing = getBreakpoints(uri, range);
      if (existing.length > 0) {
        toRemove.push(...existing);
      } else {
        if (target.isLine) {
          range = range.with(undefined, range.end.with(undefined, 0));
        }
        toAdd.push(
          new vscode.SourceBreakpoint(new vscode.Location(uri, range)),
        );
      }
    });

    vscode.debug.addBreakpoints(toAdd);
    vscode.debug.removeBreakpoints(toRemove);

    return {
      thatTargets: targets,
    };
  }
}
