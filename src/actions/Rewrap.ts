import { flatten, zip } from "lodash";
import { TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  SelectionWithContext,
  TypedSelection,
} from "../typings/Types";
import { repeat } from "../util/array";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { runForEachEditor } from "../util/targetUtils";

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

  async run(
    [targets]: [TypedSelection[]],
    left: string,
    right: string
  ): Promise<ActionReturnValue> {
    const targetInfos = targets.flatMap((target) => {
      const boundary = target.selectionContext.boundary;

      if (boundary == null || boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return {
        editor: target.selection.editor,
        boundary: boundary.map((edge) =>
          constructSimpleTypedSelection(target.selection.editor, edge)
        ),
        targetSelection: target.selection.selection,
      };
    });

    await displayPendingEditDecorations(
      targetInfos.flatMap(({ boundary }) => boundary),
      this.graph.editStyles.pendingModification0
    );

    const thatMark = flatten(
      await runForEachEditor(
        targetInfos,
        (targetInfo) => targetInfo.editor,
        async (editor, targetInfos) => {
          const edits = targetInfos.flatMap((targetInfo) =>
            zip(targetInfo.boundary, [left, right]).map(([target, text]) => ({
              editor,
              range: target!.selection.selection,
              text: text!,
            }))
          );

          const [updatedTargetSelections] =
            await performEditsAndUpdateSelections(
              this.graph.rangeUpdater,
              editor,
              edits,
              [targetInfos.map((targetInfo) => targetInfo.targetSelection)]
            );

          return updatedTargetSelections.map((selection) => ({
            editor,
            selection,
          }));
        }
      )
    );

    return { thatMark };
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
