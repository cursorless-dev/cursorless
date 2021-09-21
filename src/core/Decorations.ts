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

interface HatAdjustments {
  sizeAdjustment?: number;
  widthAdjustment?: number;
  heightAdjustment?: number;
  verticalOffset?: number;
}

type IndividualHatAdjustmentSetting = Record<HatShape, HatAdjustments>;

const DEFAULT_HAT_HEIGHT_EM = 0.5;
const DEFAULT_VERTICAL_OFFSET_EM = -0.06274;

const defaultShapeMeasurements: Record<HatShape, HatAdjustments> = {
  default: {},
  fourPointStar: {},
  threePointStar: {},
  chevron: {},
  hole: {},
  frame: {},
  curve: {},
  eye: {},
  play: {},
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

    const userSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userVerticalOffset = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const userIndividualAdjustments = vscode.workspace
      .getConfiguration("cursorless")
      .get<IndividualHatAdjustmentSetting>("individualHatAdjustments")!;

    const hatSvgMap = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        const {
          heightAdjustment = 0,
          sizeAdjustment = 0,
          widthAdjustment = 0,
          verticalOffset = 0,
        } = defaultShapeMeasurements[shape];

        const {
          heightAdjustment: userHeightAdjustment = 0,
          sizeAdjustment: userIndividualSizeAdjustment = 0,
          widthAdjustment: userWidthAdjustment = 0,
          verticalOffset: userIndividualVerticalOffset = 0,
        } = userIndividualAdjustments[shape] ?? {};

        const scaleFactor =
          1 +
          (sizeAdjustment + userSizeAdjustment + userIndividualSizeAdjustment) /
            100;

        const horizontalScaleFactor =
          1 + (widthAdjustment + userWidthAdjustment) / 100;

        const verticalScaleFactor =
          1 + (heightAdjustment + userHeightAdjustment) / 100;

        const finalHatVerticalOffset =
          (verticalOffset + userVerticalOffset + userIndividualVerticalOffset) /
          100;

        return [
          shape,
          this.processSvg(
            fontMeasurements,
            shape,
            scaleFactor * horizontalScaleFactor,
            scaleFactor * verticalScaleFactor,
            finalHatVerticalOffset
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
    horizontalScaleFactor: number,
    verticalScaleFactor: number,
    hatVerticalOffsetEm: number
  ) {
    const iconPath = join(this.extensionPath, "images", "hats", `${shape}.svg`);
    const rawSvg = readFileSync(iconPath, "utf8");
    const { characterWidth, characterHeight, fontSize } = fontMeasurements;

    const hatVerticalOffsetPx =
      (hatVerticalOffsetEm + DEFAULT_VERTICAL_OFFSET_EM) * fontSize;

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const defaultHatHeightPx = DEFAULT_HAT_HEIGHT_EM * fontSize;
    const defaultHatWidthPx =
      (originalViewBoxWidth / originalViewBoxHeight) * defaultHatHeightPx;

    const hatHeightPx = defaultHatHeightPx * verticalScaleFactor;
    const hatWidthPx = defaultHatWidthPx * horizontalScaleFactor;

    const svgWidthPx = Math.ceil(characterWidth);
    const svgHeightPx = characterHeight + hatHeightPx + hatVerticalOffsetPx;

    const hatWidthToCharacterWidthRatio = hatWidthPx / characterWidth;

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
