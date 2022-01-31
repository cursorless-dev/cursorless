import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import {
  groupTargetsForEachEditor,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { flatten } from "lodash";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Selection, TextEditor } from "vscode";
import { performOutsideAdjustment } from "../util/performInsideOutsideAdjustment";

export default class Delete implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "outside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    { showDecorations = true } = {}
  ): Promise<ActionReturnValue> {
    const groupedTargets = groupAndUnifyTargets(targets);

    if (showDecorations) {
      await displayPendingEditDecorations(
        groupedTargets.flatMap((group) => group[2]),
        this.graph.editStyles.pendingDelete
      );
    }

    const thatMark = flatten(
      await Promise.all(
        groupedTargets.map(async ([editor, targets, unifiedTargets]) => {
          const edits = unifiedTargets.map((target) => ({
            range: target.selection.selection,
            text: "",
          }));

          const [updatedSelections] = await performEditsAndUpdateSelections(
            this.graph.rangeUpdater,
            editor,
            edits,
            [targets.map((target) => target.selection.selection)]
          );

          return updatedSelections.map((selection) => ({
            editor,
            selection,
          }));
        })
      )
    );

    return { thatMark };
  }
}

function groupAndUnifyTargets(
  targets: TypedSelection[]
): [TextEditor, TypedSelection[], TypedSelection[]][] {
  return groupTargetsForEachEditor(targets).map(([editor, targets]) => [
    editor,
    targets,
    unifyOverlappingTargets(targets),
  ]);
}

function unifyOverlappingTargets(targets: TypedSelection[]) {
  if (targets.length < 2) {
    return targets;
  }
  let results = [...targets];
  results.sort((a, b) =>
    a.selection.selection.start.compareTo(b.selection.selection.start)
  );
  let run = true;
  while (run) {
    [results, run] = onePass(results);
  }
  return results;
}

function onePass(targets: TypedSelection[]): [TypedSelection[], boolean] {
  if (targets.length < 2) {
    return [targets, false];
  }
  const results: TypedSelection[] = [];
  let currentGroup: TypedSelection[] = [];
  targets.forEach((target) => {
    // No intersection. Mark start of new group
    if (
      currentGroup.length &&
      !intersects(currentGroup[currentGroup.length - 1], target)
    ) {
      results.push(mergedTargets(currentGroup));
      currentGroup = [target];
    } else {
      currentGroup.push(target);
    }
  });
  results.push(mergedTargets(currentGroup));
  return [results, results.length !== targets.length];
}

function mergedTargets(targets: TypedSelection[]): TypedSelection {
  if (targets.length === 1) {
    return targets[0];
  }
  const first = targets[0];
  const last = targets[targets.length - 1];
  const selection = new Selection(
    first.selection.selection.start,
    last.selection.selection.end
  );
  const typeSelection: TypedSelection = {
    selection: {
      selection,
      editor: first.selection.editor,
    },
    selectionType: first.selectionType,
    position: "contents",
    insideOutsideType: null,
    selectionContext: {
      leadingDelimiterRange: first.selectionContext.leadingDelimiterRange,
      trailingDelimiterRange: last.selectionContext.trailingDelimiterRange,
    },
  };
  return performOutsideAdjustment(typeSelection);
}

function intersects(targetA: TypedSelection, targetB: TypedSelection) {
  return !!targetA.selection.selection.intersection(
    targetB.selection.selection
  );
}
