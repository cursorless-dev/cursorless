import type { CharacterRange, FlashDescriptor } from "@cursorless/common";
import { FlashStyle, Range, toCharacterRange } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import type { Actions } from "./Actions";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

export class CutToClipboard implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await ide().flashRanges(targets.flatMap(getFlashDescriptors));

    const options = { showDecorations: false };

    await this.actions.copyToClipboard.run(targets, options);

    const { thatTargets } = await this.actions.remove.run(targets, options);

    return { thatTargets };
  }
}

function getFlashDescriptors(target: Target): FlashDescriptor[] {
  const { editor, contentRange } = target;
  const removalHighlightRange = target.getRemovalHighlightRange();

  const flashDescriptors: FlashDescriptor[] = [
    {
      editor,
      range: toCharacterRange(contentRange),
      style: FlashStyle.referenced,
    },
  ];

  if (removalHighlightRange.type === "line") {
    flashDescriptors.push({
      editor,
      range: removalHighlightRange,
      style: FlashStyle.pendingDelete,
    });
  } else {
    flashDescriptors.push(
      ...getOutsideOverflow(contentRange, removalHighlightRange).map(
        (overflow): FlashDescriptor => ({
          editor,
          range: toCharacterRange(overflow),
          style: FlashStyle.pendingDelete,
        }),
      ),
    );
  }

  return flashDescriptors;
}

/** Get the possible leading and trailing overflow ranges of the outside range compared to the inside range */
function getOutsideOverflow(
  insideRange: Range,
  outsideRange: CharacterRange,
): Range[] {
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
