import {
  Listener,
  Messages,
  Notifier,
  PathChangeListener,
  walkFiles,
} from "@cursorless/common";
import { VscodeApi } from "@cursorless/vscode-common";
import { cloneDeep, isEqual } from "lodash";
import * as fs from "fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";
import { vscodeGetConfigurationString } from "../VscodeConfiguration";
import VscodeEnabledHatStyleManager, {
  ExtendedHatStyleMap,
} from "../VscodeEnabledHatStyleManager";
import { HAT_SHAPES, HatShape, VscodeHatStyleName } from "../hatStyles.types";
import { FontMeasurements } from "./FontMeasurements";
import getHatThemeColors from "./getHatThemeColors";
import {
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  IndividualHatAdjustmentMap,
  defaultShapeAdjustments,
} from "./shapeAdjustments";
import { performPr1868ShapeUpdateInit } from "./performPr1868ShapeUpdateInit";
import { TextDecoder } from "util";

const CURSORLESS_HAT_SHAPES_SUFFIX = ".svg";

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

const hatShapesDirSettingId = "cursorless.private.hatShapesDir";

interface SvgInfo {
  svg: string;
  svgHeightPx: number;
  svgWidthPx: number;
}

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
  private hatsDirWatcherDisposable?: vscode.Disposable;
  private hatShapeOverrides: Record<string, vscode.Uri> = {};
  private decoder: TextDecoder = new TextDecoder("utf-8");;

  constructor(
    private vscodeApi: VscodeApi,
    private extensionContext: vscode.ExtensionContext,
    private messages: Messages,
    private enabledHatStyles: VscodeEnabledHatStyleManager,
    private fontMeasurements: FontMeasurements,
  ) {
    extensionContext.subscriptions.push(this);

    this.recomputeDecorations = this.recomputeDecorations.bind(this);

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration(
        async ({ affectsConfiguration }) => {
          if (affectsConfiguration(hatShapesDirSettingId)) {
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
    this.hatsDirWatcherDisposable?.dispose();
    const hatsDir = vscodeGetConfigurationString(hatShapesDirSettingId);

    if (hatsDir) {
      await this.updateShapeOverrides(hatsDir);

      try {
        await fs.access(hatsDir);
        this.hatsDirWatcherDisposable = watchDir(hatsDir, () =>
          this.updateShapeOverrides(hatsDir),
        );
      } catch (e) {
        console.error("cannot watch hatsDir " + hatsDir);
      }
    } else {
      this.hatShapeOverrides = {};
      await this.recomputeDecorations();
    }
  }

  private async updateShapeOverrides(hatShapesDir: string) {
    this.hatShapeOverrides = {};
    const files = await this.getHatShapePaths(hatShapesDir);

    for (const file of files) {
      const name = path.basename(file, CURSORLESS_HAT_SHAPES_SUFFIX);
      this.hatShapeOverrides[name] = vscode.Uri.from({
        scheme: "file",
        path: file,
      });
    }

    await this.recomputeDecorations();
  }

  private async getHatShapePaths(hatShapesDir: string) {
    try {
      return await walkFiles(hatShapesDir, CURSORLESS_HAT_SHAPES_SUFFIX);
    } catch (error) {
      void vscode.window.showErrorMessage(
        `Error with cursorless hat shapes dir "${hatShapesDir}": ${
          (error as Error).message
        }`,
      );
      return [];
    }
  }

  private destroyDecorations() {
    Object.values(this.decorationMap).forEach((decoration) => {
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

    performPr1868ShapeUpdateInit(
      this.extensionContext,
      this.vscodeApi,
      this.messages,
      this.enabledHatStyles.hatStyleMap,
      userSizeAdjustment,
      userVerticalOffset,
      userIndividualAdjustments,
    );

    const hatSvgMap = Object.fromEntries(
      await Promise.all(
        HAT_SHAPES.map(async (shape) => {
          const { sizeAdjustment = 0, verticalOffset = 0 } =
            defaultShapeAdjustments[shape];

          const {
            sizeAdjustment: userIndividualSizeAdjustment = 0,
            verticalOffset: userIndividualVerticalOffset = 0,
          } = userIndividualAdjustments[shape] ?? {};

          const scaleFactor =
            1 +
            (sizeAdjustment +
              userSizeAdjustment +
              userIndividualSizeAdjustment) /
              100;

          const finalVerticalOffsetEm =
            (verticalOffset +
              userVerticalOffset +
              userIndividualVerticalOffset) /
            100;

          return [
            shape,
            await this.processSvg(
              this.fontMeasurements,
              shape,
              scaleFactor,
              finalVerticalOffsetEm,
            ),
          ];
        }),
      ),
    );

    this.decorationMap = Object.fromEntries(
      Object.entries(this.enabledHatStyles.hatStyleMap).map(
        ([styleName, { color, shape }]) => {
          const svgInfo = hatSvgMap[shape];

          if (svgInfo == null) {
            return [
              styleName,
              vscode.window.createTextEditorDecorationType({}),
            ];
          }

          const { svg, svgWidthPx, svgHeightPx } = svgInfo;

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

  private checkSvg(shape: HatShape, svg: string) {
    let isOk = true;

    if (
      svg.match(/fill="(?!none)[^"]+"/) == null &&
      svg.match(/fill:(?!none)[^;]+;/) == null
    ) {
      vscode.window.showErrorMessage(
        `Raw svg '${shape}' is missing 'fill' property`,
      );
      isOk = false;
    }

    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);

    if (viewBoxMatch == null) {
      vscode.window.showErrorMessage(
        `Raw svg '${shape}' is missing 'viewBox' property`,
      );
      isOk = false;
    }

    return isOk;
  }

  private constructColoredSvgDataUri(originalSvg: string, color: string) {
    const svg = originalSvg
      .replace(/fill="(?!none)[^"]+"/g, `fill="${color}"`)
      .replace(/fill:(?!none)[^;]+;/g, `fill:${color};`)
      .replace(/\r?\n/g, " ");

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
  private async processSvg(
    fontMeasurements: FontMeasurements,
    shape: HatShape,
    scaleFactor: number,
    hatVerticalOffsetEm: number,
  ): Promise<SvgInfo | null> {
    const iconPath =
      this.hatShapeOverrides[shape] ??
      vscode.Uri.joinPath(
        this.extensionContext.extensionUri,
        "images",
        "hats",
        `${shape}.svg`,
      );
    const rawSvg = this.decoder.decode(
      await vscode.workspace.fs.readFile(iconPath),
    );
    const { characterWidth, characterHeight, fontSize } = fontMeasurements;

    if (!this.checkSvg(shape, rawSvg)) {
      return null;
    }

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
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/)!;

    const originalViewBoxString = viewBoxMatch[1];
    const [_0, _1, originalViewBoxWidthStr, originalViewBoxHeightStr] =
      originalViewBoxString.split(" ");

    const originalViewBoxWidth = Number(originalViewBoxWidthStr);
    const originalViewBoxHeight = Number(originalViewBoxHeightStr);

    return { originalViewBoxHeight, originalViewBoxWidth };
  }

  dispose() {
    this.destroyDecorations();
    this.hatsDirWatcherDisposable?.dispose();
    this.disposables.forEach(({ dispose }) => dispose());
  }
}

function watchDir(
  path: string,
  onDidChange: PathChangeListener,
): vscode.Disposable {
  const hatsDirWatcher = vscode.workspace.createFileSystemWatcher(
    new vscode.RelativePattern(path, `**/*${CURSORLESS_HAT_SHAPES_SUFFIX}`),
  );

  hatsDirWatcher.onDidChange(onDidChange);
  hatsDirWatcher.onDidCreate(onDidChange);
  hatsDirWatcher.onDidDelete(onDidChange);

  return hatsDirWatcher;
}
