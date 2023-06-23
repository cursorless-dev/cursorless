import {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  Range,
  isLineRange,
  partition,
} from "@cursorless/common";
import { chain, flatmap } from "itertools";
import { RangeTypeColors } from "./RangeTypeColors";
import { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import { generateDecorationsForCharacterRange } from "./getDecorationRanges/generateDecorationsForCharacterRange";
import { generateDecorationsForLineRange } from "./getDecorationRanges/generateDecorationsForLineRange";
import { DecorationStyle } from "./getDecorationRanges/getDecorationRanges.types";
import { getDifferentiatedRanges } from "./getDecorationRanges/getDifferentiatedRanges";
import { Decorator } from "./Decorator";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeFancyRangeHighlighter {
  private decorator: Decorator;

  constructor(colors: RangeTypeColors) {
    this.decorator = new Decorator(colors);
  }

  setRanges(editor: VscodeTextEditorImpl, ranges: GeneralizedRange[]) {
    const [lineRanges, characterRanges] = partition<LineRange, CharacterRange>(
      ranges,
      isLineRange,
    );

    const decoratedRanges = Array.from(
      chain(
        flatmap(characterRanges, ({ start, end }) =>
          generateDecorationsForCharacterRange(editor, new Range(start, end)),
        ),
        flatmap(lineRanges, ({ start, end }) =>
          generateDecorationsForLineRange(start, end),
        ),
      ),
    );

    this.decorator.setDecorations(
      editor,
      getDifferentiatedRanges(decoratedRanges, getBorderKey),
    );
  }

  dispose() {
    this.decorator.dispose();
  }
}

function getBorderKey({
  top,
  right,
  left,
  bottom,
  isWholeLine,
}: DecorationStyle) {
  return [top, right, left, bottom, isWholeLine ?? false];
}
