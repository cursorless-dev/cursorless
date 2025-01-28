import type {
  CharacterRange,
  FlashDescriptor,
  LineRange,
  TextEditor,
} from "@cursorless/common";
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
    await ide().flashRanges(
      targets.flatMap((target) => {
        const { editor, contentRange } = target;
        const removalHighlightRange = target.getRemovalHighlightRange();

        if (removalHighlightRange.type === "line") {
          return getLineFlashDescriptors(
            editor,
            contentRange,
            removalHighlightRange,
          );
        }

        return getCharacterFlashDescriptors(
          editor,
          contentRange,
          removalHighlightRange,
        );
      }),
    );

    const options = { showDecorations: false };

    await this.actions.copyToClipboard.run(targets, options);

    const { thatTargets } = await this.actions.remove.run(targets, options);

    return { thatTargets };
  }
}

function getLineFlashDescriptors(
  editor: TextEditor,
  contentRange: Range,
  removalHighlightRange: LineRange,
): FlashDescriptor[] {
  return [
    {
      editor,
      range: toCharacterRange(contentRange),
      style: FlashStyle.referenced,
    },
    {
      editor,
      range: removalHighlightRange,
      style: FlashStyle.pendingDelete,
    },
  ];
}

function getCharacterFlashDescriptors(
  editor: TextEditor,
  contentRange: Range,
  removalHighlightRange: CharacterRange,
): FlashDescriptor[] {
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
