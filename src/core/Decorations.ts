import * as vscode from "vscode";
import { join } from "path";
import {
  HatStyleName,
  HatShape,
  hatStyleMap,
  hatStyleNames,
  HAT_SHAPES,
} from "./constants";
import { readFileSync } from "fs";
import { DecorationColorSetting } from "../typings/Types";
import FontMeasurements from "./FontMeasurements";

interface ShapeMeasurements {
  hatWidthToCharacterWidthRatio: number;
  verticalOffsetEm: number;
}

interface IndividualHatAdjustment {
  hatVerticalOffset: number;
  hatSizeAdjustment: number;
}

type IndividualHatAdjustmentSetting = Record<HatShape, IndividualHatAdjustment>;

const defaultShapeMeasurements: Record<HatShape, ShapeMeasurements> = {
  default: {
    hatWidthToCharacterWidthRatio: 0.507,
    verticalOffsetEm: -0.05,
  },
  star: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.105,
  },
  tieFighter: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.105,
  },
  chevron: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  sun: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  frame: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  curve: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  eye: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  target: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
  rectangle: {
    hatWidthToCharacterWidthRatio: 0.6825,
    verticalOffsetEm: -0.12,
  },
};

export type DecorationMap = {
  [k in HatStyleName]?: vscode.TextEditorDecorationType;
};

export interface NamedDecoration {
  name: HatStyleName;
  decoration: vscode.TextEditorDecorationType;
}

export default class Decorations {
  decorations!: NamedDecoration[];
  decorationMap!: DecorationMap;

  constructor(
    fontMeasurements: FontMeasurements,
    private extensionPath: string
  ) {
    this.constructDecorations(fontMeasurements);
  }

  destroyDecorations() {
    this.decorations.forEach(({ decoration }) => {
      decoration.dispose();
    });
  }

  constructDecorations(fontMeasurements: FontMeasurements) {
    const hatSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userHatVerticalOffsetAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const userIndividualHatAdjustments = vscode.workspace
      .getConfiguration("cursorless")
      .get<IndividualHatAdjustmentSetting>("individualHatAdjustments")!;

    const hatSvgMap = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        const { hatWidthToCharacterWidthRatio, verticalOffsetEm } =
          defaultShapeMeasurements[shape];

        const individualHatSizeAdjustment =
          userIndividualHatAdjustments[shape]?.hatSizeAdjustment ?? 0;

        const hatScaleFactor =
          1 + (hatSizeAdjustment + individualHatSizeAdjustment) / 100;

        const individualVerticalOffsetAdjustment =
          userIndividualHatAdjustments[shape]?.hatVerticalOffset ?? 0;

        return [
          shape,
          this.processSvg(
            fontMeasurements,
            shape,
            hatScaleFactor * hatWidthToCharacterWidthRatio,
            (verticalOffsetEm +
              (userHatVerticalOffsetAdjustment +
                individualVerticalOffsetAdjustment) /
                100) *
              fontMeasurements.fontSize
          ),
        ];
      })
    );

    this.decorations = hatStyleNames.map((styleName) => {
      const { color, shape, strokeColor } = hatStyleMap[styleName];
      const { svg, svgWidthPx, svgHeightPx } = hatSvgMap[shape];

      const spanWidthPx =
        svgWidthPx + (fontMeasurements.characterWidth - svgWidthPx) / 2;

      const colorSetting = vscode.workspace
        .getConfiguration("cursorless.colors")
        .get<DecorationColorSetting>(color)!;

      const strokeColorSetting =
        strokeColor == null
          ? null
          : vscode.workspace
              .getConfiguration("cursorless.colors")
              .get<DecorationColorSetting>(strokeColor)!;

      return {
        name: styleName,
        decoration: vscode.window.createTextEditorDecorationType({
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
          light: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                svg,
                colorSetting.light,
                strokeColorSetting?.light
              ),
            },
          },
          dark: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                svg,
                colorSetting.dark,
                strokeColorSetting?.dark
              ),
            },
          },
          after: {
            margin: `-${svgHeightPx}px 0 0 -${spanWidthPx}px`,
            width: `${spanWidthPx}px`,
            height: `${svgHeightPx}px`,
          },
        }),
      };
    });

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }

  private constructColoredSvgDataUri(
    originalSvg: string,
    color: string,
    strokeColor?: string
  ) {
    if (
      originalSvg.match(/fill="[^"]+"/) == null &&
      originalSvg.match(/fill:[^;]+;/) == null
    ) {
      throw Error("Raw svg doesn't have fill");
    }

    let svg = originalSvg
      .replace(/fill="[^"]+"/, `fill="${color}"`)
      .replace(/fill:[^;]+;/, `fill:${color};`);

    if (strokeColor != null) {
      if (originalSvg.match(/fill:#ff0;/) == null) {
        throw Error("Raw svg doesn't have stroke");
      }

      svg = svg.replace(/fill:#ff0;/, `fill:${strokeColor};`);
    }

    const encoded = Buffer.from(svg).toString("base64");

    return vscode.Uri.parse(`data:image/svg+xml;base64,${encoded}`);
  }

  /**
   * Creates an SVG from the hat SVG that pads, offsets and scales it to end up
   * in the right size / place relative to the character it will be placed over.
   * [This image](../images/svg-calculations.png) may or may not be helpful.
   *
   * @param fontMeasurements Info about the user's font
   * @param hatWidthToCharacterWidthRatio How wide should hats be relative to character width
   * @param hatVerticalOffset How far off top of characters should hats be
   * @returns An object with the new SVG and its measurements
   */
  private processSvg(
    fontMeasurements: FontMeasurements,
    shape: HatShape,
    hatWidthToCharacterWidthRatio: number,
    hatVerticalOffset: number
  ) {
    const iconPath = join(this.extensionPath, "images", "hats", `${shape}.svg`);
    const rawSvg = readFileSync(iconPath, "utf8");

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const hatWidthPx =
      hatWidthToCharacterWidthRatio * fontMeasurements.characterWidth;
    const hatHeightPx =
      (originalViewBoxHeight / originalViewBoxWidth) * hatWidthPx;

    const svgWidthPx = Math.ceil(fontMeasurements.characterWidth);
    const svgHeightPx =
      fontMeasurements.characterHeight + hatHeightPx + hatVerticalOffset;

    const newViewBoxWidth =
      ((originalViewBoxWidth / hatWidthToCharacterWidthRatio) *
        fontMeasurements.characterWidth) /
      svgWidthPx;
    const newViewBoxHeight = (newViewBoxWidth * svgHeightPx) / svgWidthPx;
    const newViewBoxX = -(newViewBoxWidth - originalViewBoxWidth) / 2;
    const newViewBoxY = 0;

    const newViewBoxString = `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`;

    if (
      rawSvg.match(/width="[^"]+"/) == null ||
      rawSvg.match(/height="[^"]+"/) == null
    ) {
      throw Error("Raw svg doesn't have height or width");
    }

    const svg = rawSvg
      .replace(/width="[^"]+"/, `width="${svgWidthPx}px"`)
      .replace(/height="[^"]+"/, `height="${svgHeightPx}px"`)
      .replace(/viewBox="([^"]+)"/, `viewBox="${newViewBoxString}"`);

    return {
      svg,
      svgHeightPx,
      svgWidthPx,
    };
  }

  private getViewBoxDimensions(rawSvg: string) {
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch == null) {
      throw Error("View box not found in svg");
    }

    const originalViewBoxString = viewBoxMatch[1];
    const [_0, _1, originalViewBoxWidthStr, originalViewBoxHeightStr] =
      originalViewBoxString.split(" ");

    const originalViewBoxWidth = Number(originalViewBoxWidthStr);
    const originalViewBoxHeight = Number(originalViewBoxHeightStr);

    return { originalViewBoxHeight, originalViewBoxWidth };
  }
}
