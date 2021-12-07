import { TextEditor } from "vscode";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithContext,
  TypedSelection,
} from "../typings/Types";
import { repeat } from "../util/array";

export default class Rewrap implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    {
      insideOutsideType: "inside",
      modifier: {
        type: "surroundingPair",
        delimiter: "any",
        delimiterInclusion: undefined,
      },
    },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  run(
    [targets]: [TypedSelection[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const boundaries: TypedSelection[] = targets.flatMap((target) => {
      const boundary = target.selectionContext.boundary;

      if (boundary == null || boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return boundary.map((edge) =>
        constructSimpleTypedSelection(target.selection.editor, edge)
      );
    });

    const replacementTexts = repeat([left, right], targets.length);

    return this.graph.actions.replace.run([boundaries], replacementTexts);
  }
}

function constructSimpleTypedSelection(
  editor: TextEditor,
  selection: SelectionWithContext
): TypedSelection {
  return {
    selection: {
      selection: selection.selection,
      editor,
    },
    selectionType: "token",
    selectionContext: selection.context,
    insideOutsideType: null,
    position: "contents",
  };
}
