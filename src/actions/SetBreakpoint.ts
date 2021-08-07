import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../Types";
import {
  SourceBreakpoint,
  Location,
  debug,
  Uri,
  Range,
  Breakpoint,
} from "vscode";
import displayPendingEditDecorations from "../editDisplayUtils";
import { isEqual, range, uniqWith } from "lodash";

function getBreakpoint(uri: Uri, line: number) {
  return debug.breakpoints.find((breakpoint) => {
    if (breakpoint instanceof SourceBreakpoint) {
      return (
        breakpoint.location.uri.toString() === uri.toString() &&
        breakpoint.location.range.start.line === line
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

    const lines = uniqWith(
      targets.flatMap((target) => {
        const { start, end } = target.selection.selection;
        const uri = target.selection.editor.document.uri;
        return range(start.line, end.line + 1).map((line) => ({
          uri,
          line,
        }));
      }),
      isEqual
    );

    const toAdd: Breakpoint[] = [];
    const toRemove: Breakpoint[] = [];

    lines.forEach(({ uri, line }) => {
      const existing = getBreakpoint(uri, line);
      if (existing) {
        toRemove.push(existing);
      } else {
        toAdd.push(
          new SourceBreakpoint(
            new Location(uri, new Range(line, 0, line, 0)),
            true
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
