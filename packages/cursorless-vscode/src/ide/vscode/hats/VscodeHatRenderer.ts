import { cloneDeep, isEqual } from "lodash";
import * as path from "node:path";
import * as fs from "node:fs";
import * as vscode from "vscode";
import getHatThemeColors from "./getHatThemeColors";
import {
  defaultShapeAdjustments,
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  IndividualHatAdjustmentMap,
} from "./shapeAdjustments";
import { Listener, Notifier } from "@cursorless/common";
import { FontMeasurements } from "./FontMeasurements";
import { HatShape, HAT_SHAPES, VscodeHatStyleName } from "../hatStyles.types";
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
  private hatsDirWatcher?: fs.FSWatcher;
  private hatShapeOverrides: Record<string, string> = {};

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
          if (affectsConfiguration("cursorless.experimental.hatShapesDir")) {
            await this.updateHatsDirWatcher();
          } else if (
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
    await this.updateHatsDirWatcher();
  }

  /**
   * Gets the VSCode decoration type to use for the given hat style
   * @param hatStyle The name of the hat style
   * @returns A VSCode decoration type used to render the given hat style
   */
  getDecorationType(hatStyle: VscodeHatStyleName) {
    return this.decorationMap[hatStyle];
  }

  private async updateHatsDirWatcher() {
    this.destroyHatsDirWatcher();

    const hatsDir = vscode.workspace
      .getConfiguration("cursorless.experimental")
      .get<string>("hatShapesDir")!;

    if (hatsDir && fs.existsSync(hatsDir)) {
      await this.updateShapeOverrides(hatsDir);
      let timeout: NodeJS.Timeout;

      this.hatsDirWatcher = fs.watch(hatsDir, () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => this.updateShapeOverrides(hatsDir), 50);
      });
    } else {
      this.hatShapeOverrides = {};
      await this.recomputeDecorations();
    }
  }

  private async updateShapeOverrides(dir: string) {
    this.hatShapeOverrides = {};

    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".svg")) {
        this.hatShapeOverrides[file.split(".")[0]] = path.join(dir, file);
      }
    }

    await this.recomputeDecorations();
  }

  private destroyDecorations() {
    Object.values(this.decorationMap).forEach((decoration) => {
      decoration.dispose();
    });
  }

  private destroyHatsDirWatcher() {
    if (this.hatsDirWatcher != null) {
      this.hatsDirWatcher.close();
      this.hatsDirWatcher = undefined;
    }
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
    fontMeasurements: FontMeasurements,
    shape: HatShape,
    scaleFactor: number,
    hatVerticalOffsetEm: number,
  ) {
    const iconPath =
      this.hatShapeOverrides[shape] ??
      path.join(
        this.extensionContext.extensionPath,
        "images",
        "hats",
        `${shape}.svg`,
      );
    const rawSvg = fs.readFileSync(iconPath, "utf8");
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
    this.destroyHatsDirWatcher();
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
