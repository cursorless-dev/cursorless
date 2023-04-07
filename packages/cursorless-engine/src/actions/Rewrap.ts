import { FlashStyle } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { containingSurroundingPairIfUntypedModifier } from "../processTargets/modifiers/commonContainingScopeIfUntypedModifiers";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import {
  createThatMark,
  flashTargets,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

export default class Rewrap implements Action {
  getFinalStages = () => [
    this.modifierStageFactory.create(
      containingSurroundingPairIfUntypedModifier,
    ),
  ];

  constructor(
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [Target[]],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const boundaryTargets = targets.flatMap((target) => {
      const boundary = target.getBoundaryStrict();

      if (boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return boundary;
    });

    await flashTargets(ide(), boundaryTargets, FlashStyle.pendingModification0);

    const results = await runOnTargetsForEachEditor(
      boundaryTargets,
      async (editor, boundaryTargets) => {
        const edits = boundaryTargets.map((target, i) => ({
          editor,
          range: target.contentRange,
          text: i % 2 === 0 ? left : right,
        }));

        const [updatedSourceRanges, updatedThatRanges] =
          await performEditsAndUpdateRanges(
            this.rangeUpdater,
            ide().getEditableTextEditor(editor),
            edits,
            [
              targets.map((target) => target.thatTarget.contentRange),
              targets.map((target) => target.contentRange),
            ],
          );

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
