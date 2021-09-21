import * as vscode from "vscode";
import { join } from "path";
import {
  HatStyleName,
  HatShape,
  HAT_SHAPES,
  HAT_COLORS,
  HAT_NON_DEFAULT_SHAPES,
  HatStyle,
  HatColor,
} from "./constants";
import { readFileSync } from "fs";
import FontMeasurements from "./FontMeasurements";
import { sortBy } from "lodash";
import getHatThemeColors from "./getHatThemeColors";

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
    hatWidthToCharacterWidthRatio: 0.6362522386652841,
    verticalOffsetEm: -0.06274676909914044,
  },
  fourPointStar: {
    hatWidthToCharacterWidthRatio: 0.8564933982032671,
    verticalOffsetEm: -0.13176821510819492,
  },
  threePointStar: {
    hatWidthToCharacterWidthRatio: 1.199090757484574,
    verticalOffsetEm: -0.06902144600905448,
  },
  chevron: {
    hatWidthToCharacterWidthRatio: 0.8564933982032671,
    verticalOffsetEm: -0.025098707639656177,
  },
  hole: {
    hatWidthToCharacterWidthRatio: 1.0277920778439205,
    verticalOffsetEm: -0.08784547673879664,
  },
  frame: {
    hatWidthToCharacterWidthRatio: 0.7708440583829403,
    verticalOffsetEm: -0.025098707639656177,
  },
  curve: {
    hatWidthToCharacterWidthRatio: 0.8564933982032671,
    verticalOffsetEm: -0.08784547673879664,
  },
  eye: {
    hatWidthToCharacterWidthRatio: 1.1562660875744104,
    verticalOffsetEm: -0.15059224583793704,
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
  hatStyleMap!: Record<HatStyleName, HatStyle>;
  hatStyleNames!: HatStyleName[];

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
    this.constructHatStyleMap();

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

    this.decorations = this.hatStyleNames.map((styleName) => {
      const { color, shape } = this.hatStyleMap[styleName];
      const { svg, svgWidthPx, svgHeightPx } = hatSvgMap[shape];

      const { light, dark } = getHatThemeColors(color);

      return {
        name: styleName,
        decoration: vscode.window.createTextEditorDecorationType({
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
          light: {
            before: {
              contentIconPath: this.constructColoredSvgDataUri(svg, light),
            },
          },
          dark: {
            before: {
              contentIconPath: this.constructColoredSvgDataUri(svg, dark),
            },
          },
          before: {
            margin: `-${svgHeightPx}px -${svgWidthPx}px 0 0`,
            width: `${svgWidthPx}px`,
            height: `${svgHeightPx}px`,
          },
        }),
      };
    });

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }

  private constructHatStyleMap() {
    const shapeEnablement = vscode.workspace
      .getConfiguration("cursorless.hatEnablement")
      .get<Record<HatShape, boolean>>("shapes")!;
    const colorEnablement = vscode.workspace
      .getConfiguration("cursorless.hatEnablement")
      .get<Record<HatColor, boolean>>("colors")!;
    const shapePenalties = vscode.workspace
      .getConfiguration("cursorless.hatPenalties")
      .get<Record<HatShape, number>>("shapes")!;
    const colorPenalties = vscode.workspace
      .getConfiguration("cursorless.hatPenalties")
      .get<Record<HatColor, number>>("colors")!;

    shapeEnablement.default = true;
    colorEnablement.default = true;
    shapePenalties.default = 0;
    colorPenalties.default = 0;

    const activeHatColors = HAT_COLORS.filter(
      (color) => colorEnablement[color]
    );
    const activeNonDefaultHatShapes = HAT_NON_DEFAULT_SHAPES.filter(
      (shape) => shapeEnablement[shape]
    );

    this.hatStyleMap = {
      ...Object.fromEntries(
        activeHatColors.map((color) => [color, { color, shape: "default" }])
      ),
      ...Object.fromEntries(
        activeHatColors.flatMap((color) =>
          activeNonDefaultHatShapes.map((shape) => [
            `${color}-${shape}`,
            { color, shape },
          ])
        )
      ),
    } as Record<HatStyleName, HatStyle>;

    this.hatStyleNames = sortBy(
      Object.entries(this.hatStyleMap),
      ([_, hatStyle]) =>
        colorPenalties[hatStyle.color] + shapePenalties[hatStyle.shape]
    ).map(([hatStyleName, _]) => hatStyleName as HatStyleName);
  }

  private constructColoredSvgDataUri(originalSvg: string, color: string) {
    if (
      originalSvg.match(/fill="[^"]+"/) == null &&
      originalSvg.match(/fill:[^;]+;/) == null
    ) {
      throw Error("Raw svg doesn't have fill");
    }

    const svg = originalSvg
      .replace(/fill="[^"]+"/, `fill="${color}"`)
      .replace(/fill:[^;]+;/, `fill:${color};`);

    const encoded = encodeURIComponent(svg);

    return vscode.Uri.parse(`data:image/svg+xml;utf8,${encoded}`);
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
    const { characterWidth, characterHeight } = fontMeasurements;

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const hatWidthPx = hatWidthToCharacterWidthRatio * characterWidth;
    const hatHeightPx =
      (originalViewBoxHeight / originalViewBoxWidth) * hatWidthPx;

    const svgWidthPx = Math.ceil(characterWidth);
    const svgHeightPx = characterHeight + hatHeightPx + hatVerticalOffset;

    const newViewBoxWidth =
      ((originalViewBoxWidth / hatWidthToCharacterWidthRatio) * svgWidthPx) /
      characterWidth;
    const newViewBoxHeight = (newViewBoxWidth * svgHeightPx) / svgWidthPx;
    const newViewBoxX =
      (-(characterWidth - hatWidthPx) * (newViewBoxWidth / svgWidthPx)) / 2;
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
