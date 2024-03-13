import {
  FlashDescriptor,
  FlashStyle,
  Range,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export class CutToClipboard implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const flashDescriptors_ = await Promise.all(
      targets.map(async (target) => {
        const { editor, contentRange } = target;
        const removalHighlightRange = await target.getRemovalHighlightRange();

        if (target.isLine) {
          return [
            {
              editor,
              range: toCharacterRange(contentRange),
              style: FlashStyle.referenced,
            },
            {
              editor,
              range: toLineRange(removalHighlightRange),
              style: FlashStyle.pendingDelete,
            },
          ];
        }

        return [
          {
            editor,
            range: toCharacterRange(contentRange),
            style: FlashStyle.referenced,
          },
          ...getOutsideOverflow(contentRange, removalHighlightRange).map(
            (overflow): FlashDescriptor => ({
              editor,
              range: toCharacterRange(overflow),
              style: FlashStyle.pendingDelete,
            }),
          ),
        ];
      }),
    );
    const flashDescriptors = flashDescriptors_.flat();
    await ide().flashRanges(flashDescriptors);

    const options = { showDecorations: false };

    await this.actions.copyToClipboard.run(targets, options);

    const { thatTargets } = await this.actions.remove.run(targets, options);

    return { thatTargets };
  }
}

/** Get the possible leading and trailing overflow ranges of the outside range compared to the inside range */
function getOutsideOverflow(insideRange: Range, outsideRange: Range): Range[] {
  const { start: insideStart, end: insideEnd } = insideRange;
  const { start: outsideStart, end: outsideEnd } = outsideRange;
  const result = [];
  if (outsideStart.isBefore(insideStart)) {
    result.push(new Range(outsideStart, insideStart));
  }
  if (outsideEnd.isAfter(insideEnd)) {
    result.push(new Range(insideEnd, outsideEnd));
  }
  return result;
}
