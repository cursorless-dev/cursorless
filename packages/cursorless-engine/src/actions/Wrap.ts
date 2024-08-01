import type {
  Edit} from "@cursorless/common";
import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  toCharacterRange,
} from "@cursorless/common";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Wrap {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const results = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const boundaries = targets.map((target) => ({
          start: new Selection(
            target.contentRange.start,
            target.contentRange.start,
          ),
          end: new Selection(target.contentRange.end, target.contentRange.end),
        }));

        const edits: Edit[] = boundaries.flatMap(({ start, end }) => [
          {
            text: left,
            range: start,
          },
          {
            text: right,
            range: end,
            isReplace: true,
          },
        ]);

        const contentSelections = targets.map(
          (target) => target.contentSelection,
        );

        const {
          boundariesStartSelections: delimiterStartSelections,
          boundariesEndSelections: delimiterEndSelections,
          sourceSelections: sourceMarkSelections,
          thatSelections: thatMarkSelections,
        } = await performEditsAndUpdateSelections({
          rangeUpdater: this.rangeUpdater,
          editor: ide().getEditableTextEditor(editor),
          edits,
          selections: {
            boundariesStartSelections: {
              selections: boundaries.map(({ start }) => start),
              behavior: RangeExpansionBehavior.openClosed,
            },
            boundariesEndSelections: {
              selections: boundaries.map(({ end }) => end),
              behavior: RangeExpansionBehavior.closedOpen,
            },
            sourceSelections: {
              selections: contentSelections,
              behavior: RangeExpansionBehavior.closedClosed,
            },
            thatSelections: {
              selections: contentSelections,
              behavior: RangeExpansionBehavior.openOpen,
            },
          },
        });

        const delimiterSelections = [
          ...delimiterStartSelections,
          ...delimiterEndSelections,
        ];

        await ide().flashRanges(
          delimiterSelections.map((selection) => ({
            editor,
            range: toCharacterRange(selection),
            style: FlashStyle.justAdded,
          })),
        );

        return {
          sourceMark: sourceMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
          thatMark: thatMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
        };
      },
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
