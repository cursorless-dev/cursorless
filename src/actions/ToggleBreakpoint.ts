import {
  Breakpoint,
  debug,
  Location,
  Range,
  SourceBreakpoint,
  Uri,
} from "vscode";
import { containingLineIfUntypedStage } from "../processTargets/modifiers/commonContainingScopeIfUntypedStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

function getBreakpoints(uri: Uri, range: Range) {
  return debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      breakpoint.location.range.intersection(range) != null,
  );
}

export default class ToggleBreakpoint implements Action {
  getFinalStages = () => [containingLineIfUntypedStage];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[], Target[]]): Promise<ActionReturnValue> {
    const thatTargets = targets.map(({ thatTarget }) => thatTarget);

    await this.graph.editStyles.displayPendingEditDecorations(
      thatTargets,
      this.graph.editStyles.referenced,
    );

    const toAdd: Breakpoint[] = [];
    const toRemove: Breakpoint[] = [];

    targets.forEach((target) => {
      let range = target.contentRange;
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
        toAdd.push(new SourceBreakpoint(new Location(uri, range)));
      }
    });

    debug.addBreakpoints(toAdd);
    debug.removeBreakpoints(toRemove);

    return {
      thatMark: createThatMark(thatTargets),
    };
  }
}
