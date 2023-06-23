import {
  CharacterRange,
  GeneralizedRange,
  LineRange,
  Range,
  isLineRange,
  partition,
} from "@cursorless/common";
import { chain, flatmap } from "itertools";
import { RangeTypeColors } from "../RangeTypeColors";
import { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import { generateDecorationsForCharacterRange } from "./generateDecorationsForCharacterRange";
import { generateDecorationsForLineRange } from "./generateDecorationsForLineRange";
import { DecorationStyle } from "./getDecorationRanges.types";
import { getDifferentiatedRanges } from "./getDifferentiatedRanges";
import { VscodeFancyRangeHighlighterRenderer } from "./VscodeFancyRangeHighlighterRenderer";

/**
 * Manages VSCode decoration types for a highlight or flash style.
 */
export class VscodeFancyRangeHighlighter {
  private decorator: VscodeFancyRangeHighlighterRenderer;

  constructor(colors: RangeTypeColors) {
    this.decorator = new VscodeFancyRangeHighlighterRenderer(colors);
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
