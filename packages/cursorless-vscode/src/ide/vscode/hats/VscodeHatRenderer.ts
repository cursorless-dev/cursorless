import { readFileSync } from "fs";
import { cloneDeep, isEqual } from "lodash";
import { join } from "path";
import * as vscode from "vscode";
import getHatThemeColors from "./getHatThemeColors";
import {
  defaultShapeAdjustments,
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  IndividualHatAdjustmentMap,
  HatShapeSpecs,
} from "./shapeAdjustments";
import { Listener, Notifier } from "@cursorless/common";
import { FontMeasurements } from "./FontMeasurements";
import { HAT_SHAPES, VscodeHatStyleName } from "../hatStyles.types";
import VscodeEnabledHatStyleManager, {
  ExtendedHatStyleMap,
} from "../VscodeEnabledHatStyleManager";

type HatDecorationMap = Partial<
  Record<VscodeHatStyleName, vscode.TextEditorDecorationType>
>;

/**
 * VSCode configuration sections that influence hat rendering.  We redraw hats
 * if any of these sections change.
 */
const hatConfigSections = [
  "editor.fontSize",
  "editor.fontFamily",
  "cursorless.colors",
  "cursorless.hatSizeAdjustment",
  "cursorless.hatVerticalOffset",
  "cursorless.individualHatAdjustments",
  "cursorless.hatShapes",
];

/**
 * Maintains the VSCode decoration type objects corresponding to each hat style.
 * This class is responsible for the actual svgs / colors used to render the
 * hats.  The decision about which hat styles should be available is up to
 * {@link VscodeEnabledHatStyles}
 */
export default class VscodeHatRenderer {
  private decorationMap!: HatDecorationMap;
  private disposables: vscode.Disposable[] = [];
  private notifier: Notifier<[]> = new Notifier();
  private lastSeenEnabledHatStyles: ExtendedHatStyleMap = {};

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private enabledHatStyles: VscodeEnabledHatStyleManager,
    private fontMeasurements: FontMeasurements,
  ) {
    extensionContext.subscriptions.push(this);

    this.recomputeDecorations = this.recomputeDecorations.bind(this);

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(
        async ({ affectsConfiguration }) => {
          if (
            hatConfigSections.some((section) => affectsConfiguration(section))
          ) {
            await this.recomputeDecorations();
          }
        },
      ),
    );
  }

  public async forceRecomputeDecorationStyles() {
    this.fontMeasurements.clearCache();
    await this.recomputeDecorations();
  }

  async handleNewStylesIfNecessary() {
    if (
      isEqual(this.lastSeenEnabledHatStyles, this.enabledHatStyles.hatStyleMap)
    ) {
      return;
    }

    await this.recomputeDecorations();
  }

  registerListener(listener: Listener<[]>) {
    return this.notifier.registerListener(listener);
  }

  async init() {
    await this.constructDecorations();
  }

  /**
   * Gets the VSCode decoration type to use for the given hat style
   * @param hatStyle The name of the hat style
   * @returns A VSCode decoration type used to render the given hat style
   */
  getDecorationType(hatStyle: VscodeHatStyleName) {
    return this.decorationMap[hatStyle];
  }

  private destroyDecorations() {
    Object.values(this.decorationMap).forEach((decoration) => {
      if (decoration === undefined) {
        return;
      }
      decoration.dispose();
    });
  }

  private async recomputeDecorations() {
    this.destroyDecorations();
    await this.constructDecorations();
    this.notifier.notifyListeners();
  }

  private async constructDecorations() {
    await this.fontMeasurements.calculate();

    const userSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userVerticalOffset = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const userIndividualAdjustments = vscode.workspace
      .getConfiguration("cursorless")
      .get<IndividualHatAdjustmentMap>("individualHatAdjustments")!;

    const userHatShapes = vscode.workspace
      .getConfiguration("cursorless")
      .get<HatShapeSpecs>("hatShapes")!;

    // console.log("NEW HAT SHAPES", JSON.stringify(userHatShapes));

    const customHats: Map<string, string> = new Map();
    const allHatShapes: string[] = [...HAT_SHAPES];
    for (const [key, value] of Object.entries(userHatShapes)) {
      const enabled = value.enabled ?? true;
      if (!enabled) {
        continue;
      }
      if (value.path === undefined && value.ellipse === undefined) {
        console.log("ERROR: path or ellipse must be defined");
        continue;
      }

      // console.log("KV", key, value);
      const viewBoxWidth = value.viewBoxWidth ?? 100;
      const viewBoxHeight = value.viewBoxHeight ?? 1;
      const transform = value.transform ?? "";
      if (value.path === undefined && value.ellipse === undefined) {
        console.log("ERROR: path or ellipse must be defined");
        return;
      }
      // TODO: colors
      const g = value.path
        ? `<path transform="${transform}" fill="#000" d="${value.path}"></path>`
        : `<ellipse transform="${transform}" fill="#000" cx="${
            value.ellipse![0]
          }" cy="${value.ellipse![1]}" rx="${value.ellipse![2]}" ry="${
            value.ellipse![3]
          }"></ellipse>`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} ${viewBoxHeight}" width="1em" height="1em"><g>${g}</g></svg>`;

      customHats.set(key, svg);
      if (!allHatShapes.includes(key)) {
        allHatShapes.push(key);
      }
    }

    const hatSvgMap = Object.fromEntries(
      allHatShapes.map((shape) => {
        const { sizeAdjustment = 0, verticalOffset = 0 } =
          defaultShapeAdjustments[shape] ?? {};

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
            customHats.get(shape) ?? "",
            this.fontMeasurements,
            shape,
            scaleFactor,
            finalVerticalOffsetEm,
          ),
        ];
      }),
    );

    this.decorationMap = Object.fromEntries(
      Object.entries(this.enabledHatStyles.hatStyleMap).map(
        ([styleName, { color, shape }]) => {
          const { svg, svgWidthPx, svgHeightPx } = hatSvgMap[shape];

          const { light, dark } = getHatThemeColors(color);

          return [
            styleName,
            vscode.window.createTextEditorDecorationType({
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
          ];
        },
      ),
    );

    this.lastSeenEnabledHatStyles = cloneDeep(
      this.enabledHatStyles.hatStyleMap,
    );
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
   * [This image](../../../../images/svg-calculations.png) may or may not be helpful.
   *
   * @param fontMeasurements Info about the user's font
   * @param shape The hat shape to process
   * @param scaleFactor How much to scale the hat
   * @param hatVerticalOffsetEm How far off top of characters should hats be
   * @returns An object with the new SVG and its measurements
   */
  private processSvg(
    customSVG: string,
    fontMeasurements: FontMeasurements,
    shape: string,
    scaleFactor: number,
    hatVerticalOffsetEm: number,
  ) {
    let rawSvg = customSVG;
    if (rawSvg === "") {
      // console.log(`LOADING ${shape} from file`);
      const iconPath = join(
        this.extensionContext.extensionPath,
        "images",
        "hats",
        `${shape}.svg`,
      );
      rawSvg = readFileSync(iconPath, "utf8");
    } else {
      // console.log(`using ${shape} = ${rawSvg}`);
    }
    const { characterWidth, characterHeight, fontSize } = fontMeasurements;

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const defaultHatHeightPx = DEFAULT_HAT_HEIGHT_EM * fontSize;
    const defaultHatWidthPx =
      (originalViewBoxWidth / originalViewBoxHeight) * defaultHatHeightPx;

    const hatHeightPx = defaultHatHeightPx * scaleFactor;
    const hatWidthPx = defaultHatWidthPx * scaleFactor;

    // If svg is too wide, scale it down. This will change the aspect ratio
    const maxHatWidthPx = characterWidth - 1;
    const widthFactor =
      hatWidthPx > maxHatWidthPx ? maxHatWidthPx / hatWidthPx : 1;

    const hatVerticalOffsetPx =
      (DEFAULT_VERTICAL_OFFSET_EM + hatVerticalOffsetEm) * fontSize -
      hatHeightPx / 2;

    const svgWidthPx = Math.ceil(characterWidth);
    const svgHeightPx = characterHeight + hatHeightPx + hatVerticalOffsetPx;

    const newViewBoxWidth = originalViewBoxWidth * (svgWidthPx / hatWidthPx);
    const newViewBoxHeight = newViewBoxWidth * (svgHeightPx / svgWidthPx);
    const newViewBoxX =
      (-(characterWidth - hatWidthPx * widthFactor) *
        (newViewBoxWidth / svgWidthPx)) /
      2;
    const newViewBoxY = 0;

    const newViewBoxString = `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`;

    const innerSvg = rawSvg
      .replace(/width="[^"]+"/, ``)
      .replace(/height="[^"]+"/, ``)
      .replace(/viewBox="([^"]+)"/, `style="overflow:visible"`);

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" ` +
      `viewBox="${newViewBoxString}" ` +
      `width="${svgWidthPx}px" ` +
      `height="${svgHeightPx}px">` +
      `<g transform="scale(${widthFactor}, 1)">${innerSvg}</g></svg>`;

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
