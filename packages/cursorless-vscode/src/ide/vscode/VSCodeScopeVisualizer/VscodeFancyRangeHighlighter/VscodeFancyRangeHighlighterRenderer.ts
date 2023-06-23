import { CompositeKeyDefaultMap } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import {
  DecorationRangeBehavior,
  DecorationRenderOptions,
  TextEditorDecorationType,
  window,
} from "vscode";
import { RangeTypeColors } from "../RangeTypeColors";
import { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import {
  BorderStyle,
  DecorationStyle,
  DifferentiatedStyle,
  DifferentiatedStyledRangeList,
} from "./getDecorationRanges.types";

export class VscodeFancyRangeHighlighterRenderer {
  private decorationTypes: CompositeKeyDefaultMap<
    DifferentiatedStyle<DecorationStyle>,
    TextEditorDecorationType
  >;

  constructor(colors: RangeTypeColors) {
    this.decorationTypes = new CompositeKeyDefaultMap(
      ({ style }) => getDecorationStyle(colors, style),
      ({
        style: { top, right, bottom, left, isWholeLine },
        differentiationIndex,
      }) => [
        top,
        right,
        bottom,
        left,
        isWholeLine ?? false,
        differentiationIndex,
      ],
    );
  }

  setRanges(
    editor: VscodeTextEditorImpl,
    decoratedRanges: DifferentiatedStyledRangeList<DecorationStyle>[],
  ) {
    const untouchedDecorationTypes = new Set(this.decorationTypes.values());

    decoratedRanges.sort(
      (a, b) =>
        a.differentiatedStyles.differentiationIndex -
        b.differentiatedStyles.differentiationIndex,
    );

    decoratedRanges.forEach(({ differentiatedStyles: styleParameters, ranges }) => {
      const decorationType = this.decorationTypes.get(styleParameters);

      editor.vscodeEditor.setDecorations(
        decorationType,
        ranges.map(toVscodeRange),
      );

      untouchedDecorationTypes.delete(decorationType);
    });

    untouchedDecorationTypes.forEach((decorationType) => {
      editor.vscodeEditor.setDecorations(decorationType, []);
    });
  }

  dispose() {
    Array.from(this.decorationTypes.values()).forEach((decorationType) => {
      decorationType.dispose();
    });
  }
}

function getDecorationStyle(
  colors: RangeTypeColors,
  borders: DecorationStyle,
): TextEditorDecorationType {
  const options: DecorationRenderOptions = {
    light: {
      backgroundColor: colors.background.light,
      borderColor: getBorderColor(
        colors.borderSolid.light,
        colors.borderPorous.light,
        borders,
      ),
    },
    dark: {
      backgroundColor: colors.background.dark,
      borderColor: getBorderColor(
        colors.borderSolid.dark,
        colors.borderPorous.dark,
        borders,
      ),
    },
    borderStyle: getBorderStyle(borders),
    borderWidth: "1px",
    borderRadius: getBorderRadius(borders),
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    isWholeLine: borders.isWholeLine,
  };

  return window.createTextEditorDecorationType(options);
}

function getBorderStyle(borders: DecorationStyle): string {
  return [borders.top, borders.right, borders.bottom, borders.left].join(" ");
}

function getBorderColor(
  solidColor: string,
  porousColor: string,
  borders: DecorationStyle,
): string {
  return [
    borders.top === BorderStyle.solid ? solidColor : porousColor,
    borders.right === BorderStyle.solid ? solidColor : porousColor,
    borders.bottom === BorderStyle.solid ? solidColor : porousColor,
    borders.left === BorderStyle.solid ? solidColor : porousColor,
  ].join(" ");
}

function getBorderRadius({
  top,
  right,
  bottom,
  left,
}: DecorationStyle): string {
  return [
    top === BorderStyle.solid && left === BorderStyle.solid ? "2px" : "0px",
    top === BorderStyle.solid && right === BorderStyle.solid ? "2px" : "0px",
    bottom === BorderStyle.solid && right === BorderStyle.solid ? "2px" : "0px",
    bottom === BorderStyle.solid && left === BorderStyle.solid ? "2px" : "0px",
  ].join(" ");
}
