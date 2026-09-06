import type { IDE } from "@cursorless/lib-common";
import { FlashStyle } from "@cursorless/lib-common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { getContainingSurroundingPairIfNoBoundaryStage } from "../processTargets/modifiers/BoundaryStage";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { Target } from "../typings/target.types";
import {
  createThatMark,
  flashTargets,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export class Rewrap {
  getFinalStages = () => [
    getContainingSurroundingPairIfNoBoundaryStage(this.modifierStageFactory),
  ];

  constructor(
    private ide: IDE,
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const boundaryTargets = targets.flatMap((target) => {
      const boundary = target.getBoundary()!;

      if (boundary.length !== 2) {
        throw new Error("Target must have an opening and closing delimiter");
      }

      return boundary;
    });

    await flashTargets(
      this.ide,
      boundaryTargets,
      FlashStyle.pendingModification0,
    );

    const results = await runOnTargetsForEachEditor(
      boundaryTargets,
      async (editor, boundaryTargets) => {
        const edits = boundaryTargets.map((target, i) => ({
          editor,
          range: target.contentRange,
          text: i % 2 === 0 ? left : right,
        }));

        const {
          sourceRanges: updatedSourceRanges,
          thatRanges: updatedThatRanges,
        } = await performEditsAndUpdateSelections({
          rangeUpdater: this.rangeUpdater,
          editor: this.ide.getEditableTextEditor(editor),
          edits,
          selections: {
            sourceRanges: targets.map(
              (target) => target.thatTarget.contentRange,
            ),
            thatRanges: targets.map((target) => target.contentRange),
          },
        });

        return {
          sourceMark: createThatMark(targets, updatedSourceRanges),
          thatMark: createThatMark(targets, updatedThatRanges),
        };
      },
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
