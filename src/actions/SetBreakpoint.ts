import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithEditor,
  TypedSelection,
} from "../Types";
import { SourceBreakpoint, Location, debug, Range, Breakpoint } from "vscode";
import displayPendingEditDecorations from "../editDisplayUtils";

function getBreakpoint(location: Location) {
  return debug.breakpoints.find((breakpoint) => {
    if (breakpoint instanceof SourceBreakpoint) {
      return (
        breakpoint.location.uri.toString() === location.uri.toString() &&
        breakpoint.location.range.isEqual(location.range)
      );
    }
    return false;
  });
}

export default class SetBreakpoint implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    await displayPendingEditDecorations(
      targets,
      this.graph.editStyles.referenced
    );

    const toAdd: Breakpoint[] = [];
    const toRemove: Breakpoint[] = [];

    targets.forEach((target) => {
      const location = new Location(
        target.selection.editor.document.uri,
        target.selection.selection.start
      );
      const existing = getBreakpoint(location);
      if (existing) {
        toRemove.push(existing);
      } else {
        toAdd.push(new SourceBreakpoint(location, true));
      }
    });

    debug.addBreakpoints(toAdd);
    debug.removeBreakpoints(toRemove);

    const thatMark = targets.map((target) => target.selection);

    return { thatMark };
  }
}
