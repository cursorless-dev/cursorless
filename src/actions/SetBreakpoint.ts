import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import {
  SourceBreakpoint,
  Location,
  debug,
  Uri,
  Range,
  Breakpoint,
} from "vscode";
import displayPendingEditDecorations from "../util/editDisplayUtils";

function getBreakpoints(uri: Uri, range: Range) {
  return debug.breakpoints.filter(
    (breakpoint) =>
      breakpoint instanceof SourceBreakpoint &&
      breakpoint.location.uri.toString() === uri.toString() &&
      breakpoint.location.range.intersection(range) != null
  );
}

export default class SetBreakpoint implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside", selectionType: "line" },
  ];

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
      const uri = target.selection.editor.document.uri;
      const existing = getBreakpoints(uri, target.selection.selection);
      if (existing.length > 0) {
        toRemove.push(...existing);
      } else {
        toAdd.push(
          new SourceBreakpoint(
            new Location(uri, target.selection.selection.start)
          )
        );
      }
    });

    debug.addBreakpoints(toAdd);
    debug.removeBreakpoints(toRemove);

    const thatMark = targets.map((target) => target.selection);

    return { thatMark };
  }
}
