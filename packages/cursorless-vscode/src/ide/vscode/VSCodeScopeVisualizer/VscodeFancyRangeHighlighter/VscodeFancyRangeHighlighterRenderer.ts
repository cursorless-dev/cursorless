import { CompositeKeyDefaultMap } from "@cursorless/common";
import { toVscodeRange } from "@cursorless/vscode-common";
import {
  DecorationRangeBehavior,
  DecorationRenderOptions,
  TextEditorDecorationType,
} from "vscode";
import { vscodeApi } from "../../../../vscodeApi";
import { VscodeTextEditorImpl } from "../../VscodeTextEditorImpl";
import { RangeTypeColors } from "../RangeTypeColors";
import {
  BorderStyle,
  DecorationStyle,
  DifferentiatedStyle,
  DifferentiatedStyledRangeList,
} from "./decorationStyle.types";
import { getDifferentiatedStyleMapKey } from "./getDifferentiatedStyleMapKey";

const BORDER_WIDTH = "1px";
const BORDER_RADIUS = "2px";

/**
 * Handles the actual rendering of decorations for
 * {@link VscodeFancyRangeHighlighter}.
 */
export class VscodeFancyRangeHighlighterRenderer {
  private decorationTypes: CompositeKeyDefaultMap<
    DifferentiatedStyle,
    TextEditorDecorationType
  >;

  constructor(colors: RangeTypeColors) {
    this.decorationTypes = new CompositeKeyDefaultMap(
      ({ style }) => getDecorationStyle(colors, style),
      getDifferentiatedStyleMapKey,
    );
  }

  /**
   * Renders the given ranges in the given editor.
   *
   * @param editor The editor to render the decorations in.
   * @param decoratedRanges A list with one element per differentiated style,
   * each of which contains a list of ranges to render for that style. We render
   * the ranges in order of increasing differentiation index.
   * {@link VscodeFancyRangeHighlighter} uses this to ensure that nested ranges
   * are rendered after their parents.  Otherwise they partially interleave,
   * which looks bad.
   */
  setRanges(
    editor: VscodeTextEditorImpl,
    decoratedRanges: DifferentiatedStyledRangeList[],
  ): void {
    /**
     * Keep track of which styles have no ranges, so that we can set their
     * range list to `[]`
     */
    const untouchedDecorationTypes = new Set(this.decorationTypes.values());

    decoratedRanges.sort(
      (a, b) =>
        a.differentiatedStyle.differentiationIndex -
        b.differentiatedStyle.differentiationIndex,
    );

    decoratedRanges.forEach(
      ({ differentiatedStyle: styleParameters, ranges }) => {
        const decorationType = this.decorationTypes.get(styleParameters);

        vscodeApi.editor.setDecorations(
          editor.vscodeEditor,
          decorationType,
          ranges.map(toVscodeRange),
        );

        untouchedDecorationTypes.delete(decorationType);
      },
    );

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
    borderWidth: BORDER_WIDTH,
    borderRadius: getBorderRadius(borders),
    rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    isWholeLine: borders.isWholeLine,
  };

  return vscodeApi.window.createTextEditorDecorationType(options);
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

function getBorderRadius(borders: DecorationStyle): string {
  return [
    getSingleCornerBorderRadius(borders.top, borders.left),
    getSingleCornerBorderRadius(borders.top, borders.right),
    getSingleCornerBorderRadius(borders.bottom, borders.right),
    getSingleCornerBorderRadius(borders.bottom, borders.left),
  ].join(" ");
}

function getSingleCornerBorderRadius(side1: BorderStyle, side2: BorderStyle) {
  // We only round the corners if both sides are solid, as that makes them look
  // more finished, whereas we want the dotted borders to look unfinished / cut
  // off.
  return side1 === BorderStyle.solid && side2 === BorderStyle.solid
    ? BORDER_RADIUS
    : "0px";
}
