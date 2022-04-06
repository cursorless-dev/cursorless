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
import { pull, sortBy, filter } from "lodash";
import getHatThemeColors from "./getHatThemeColors";
import {
  IndividualHatAdjustmentMap,
  defaultShapeAdjustments,
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
} from "./shapeAdjustments";
import { Graph } from "../typings/Types";
import isTesting from "../testUtil/isTesting";

export type DecorationMap = {
  [k in HatStyleName]?: vscode.TextEditorDecorationType;
};

export interface NamedDecoration {
  name: HatStyleName;
  decoration: vscode.TextEditorDecorationType;
}

type DecorationChangeListener = () => void;

export default class Decorations {
  decorations!: NamedDecoration[];
  decorationMap!: DecorationMap;
  private hatStyleMap!: Record<HatStyleName, HatStyle>;
  hatStyleNames!: HatStyleName[];
  private decorationChangeListeners: DecorationChangeListener[] = [];
  private disposables: vscode.Disposable[] = [];

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);

    this.recomputeDecorationStyles = this.recomputeDecorationStyles.bind(this);

    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.recomputeDecorationStyles",
        () => {
          graph.fontMeasurements.clearCache();
          this.recomputeDecorationStyles();
        }
      ),

      vscode.workspace.onDidChangeConfiguration(this.recomputeDecorationStyles)
    );
  }

  async init() {
    await this.graph.fontMeasurements.calculate();
    this.constructDecorations(this.graph.fontMeasurements);
  }

  /**
   * Register to be notified when decoration styles are updated, for example if
   * the user enables a new hat style
   * @param listener A function to be called when decoration styles are updated
   * @returns A function that can be called to unsubscribe from notifications
   */
  registerDecorationChangeListener(listener: DecorationChangeListener) {
    this.decorationChangeListeners.push(listener);

    return () => {
      pull(this.decorationChangeListeners, listener);
    };
  }

  private destroyDecorations() {
    this.decorations.forEach(({ decoration }) => {
      decoration.dispose();
    });
  }

  private async recomputeDecorationStyles() {
    this.destroyDecorations();
    await this.graph.fontMeasurements.calculate();
    this.constructDecorations(this.graph.fontMeasurements);
  }

  private constructDecorations(fontMeasurements: FontMeasurements) {
    this.constructHatStyleMap();

    const userSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userVerticalOffset = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const userIndividualAdjustments = vscode.workspace
      .getConfiguration("cursorless")
      .get<IndividualHatAdjustmentMap>("individualHatAdjustments")!;

    const hatSvgMap = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        const { sizeAdjustment = 0, verticalOffset = 0 } =
          defaultShapeAdjustments[shape];

        const {
          sizeAdjustment: userIndividualSizeAdjustment = 0,
          verticalOffset: userIndividualVerticalOffset = 0,
        } = userIndividualAdjustments[shape] ?? {};

        const scaleFactor =
          1 +
          (sizeAdjustment + userSizeAdjustment + userIndividualSizeAdjustment) /
            100;

        const finalVerticalOffsetEm =
          (verticalOffset + userVerticalOffset + userIndividualVerticalOffset) /
          100;

        return [
          shape,
          this.processSvg(
            fontMeasurements,
            shape,
            scaleFactor,
            finalVerticalOffsetEm
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

    this.decorationChangeListeners.forEach((listener) => listener());
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
    const maxPenalty = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>("maximumHatStylePenalty")!;

    shapeEnablement.default = true;
    colorEnablement.default = true;
    shapePenalties.default = 0;
    colorPenalties.default = 0;

    // So that unit tests don't fail locally if you have some colors disabled
    const activeHatColors = isTesting()
      ? HAT_COLORS.filter((color) => !color.startsWith("user"))
      : HAT_COLORS.filter((color) => colorEnablement[color]);
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

    if (maxPenalty > 0) {
      this.hatStyleMap = {
        ...Object.fromEntries(
          filter(
            Object.entries(this.hatStyleMap),
            ([_, hatStyle]) =>
              colorPenalties[hatStyle.color] + shapePenalties[hatStyle.shape] <=
              maxPenalty
          )
        ),
      } as Record<HatStyleName, HatStyle>;
    }

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
   * [This image](../../images/svg-calculations.png) may or may not be helpful.
   *
   * @param fontMeasurements Info about the user's font
   * @param shape The hat shape to process
   * @param scaleFactor How much to scale the hat
   * @param hatVerticalOffsetEm How far off top of characters should hats be
   * @returns An object with the new SVG and its measurements
   */
  private processSvg(
    fontMeasurements: FontMeasurements,
    shape: HatShape,
    scaleFactor: number,
    hatVerticalOffsetEm: number
  ) {
    const iconPath = join(
      this.graph.extensionContext.extensionPath,
      "images",
      "hats",
      `${shape}.svg`
    );
    const rawSvg = readFileSync(iconPath, "utf8");
    const { characterWidth, characterHeight, fontSize } = fontMeasurements;

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const defaultHatHeightPx = DEFAULT_HAT_HEIGHT_EM * fontSize;
    const defaultHatWidthPx =
      (originalViewBoxWidth / originalViewBoxHeight) * defaultHatHeightPx;

    const hatHeightPx = defaultHatHeightPx * scaleFactor;
    const hatWidthPx = defaultHatWidthPx * scaleFactor;

    const hatVerticalOffsetPx =
      (DEFAULT_VERTICAL_OFFSET_EM + hatVerticalOffsetEm) * fontSize -
      hatHeightPx / 2;

    const svgWidthPx = Math.ceil(characterWidth);
    const svgHeightPx = characterHeight + hatHeightPx + hatVerticalOffsetPx;

    const newViewBoxWidth = originalViewBoxWidth * (svgWidthPx / hatWidthPx);
    const newViewBoxHeight = newViewBoxWidth * (svgHeightPx / svgWidthPx);
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

  dispose() {
    this.destroyDecorations();
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
