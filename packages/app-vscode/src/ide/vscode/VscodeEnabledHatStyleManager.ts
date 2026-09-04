import { pickBy } from "lodash-es";
import vscode from "vscode";
import type {
  HatStyleInfo,
  HatStyleMap,
  Listener,
} from "@cursorless/lib-common";
import { Notifier } from "@cursorless/lib-common";
import type { HatColor, HatShape, VscodeHatStyleName } from "./hatStyles.types";
import { HAT_COLORS, HAT_NON_DEFAULT_SHAPES } from "./hatStyles.types";

export interface ExtendedHatStyleInfo extends HatStyleInfo {
  color: HatColor;
  shape: HatShape;
}

export type ExtendedHatStyleMap = Partial<
  Record<VscodeHatStyleName, ExtendedHatStyleInfo>
>;

interface Settings {
  shapeEnablement: Record<HatShape, boolean>;
  colorEnablement: Record<HatColor, boolean>;
  shapePenalties: Record<HatShape, number>;
  colorPenalties: Record<HatColor, number>;
  maxPenalty: number;
}

/**
 * Keeps track of the available hat styles, along with their associated color
 * and shape identifiers, and penalties.  Note that this class is not
 * responsible for deciding how these colors / shapes should be displayed.  The
 * actual display mechanics are handled by {@link VscodeHatDecorationMap}.
 *
 * In VSCode, there is a hat style for every shape-color combination, filtered
 * by those whose penalty is not too large.
 */
export class VscodeEnabledHatStyleManager {
  hatStyleMap!: ExtendedHatStyleMap;
  private notifier: Notifier<[HatStyleMap]> = new Notifier();

  constructor(private extensionContext: vscode.ExtensionContext) {
    this.recomputeEnabledHatStyles = this.recomputeEnabledHatStyles.bind(this);

    extensionContext.subscriptions.push(
      // Don't use fine grained settings here until tokenizer has migrated to graph
      vscode.workspace.onDidChangeConfiguration(this.recomputeEnabledHatStyles),
    );

    this.constructHatStyleMap();
  }

  registerListener(listener: Listener<[HatStyleMap]>) {
    return this.notifier.registerListener(listener);
  }

  private recomputeEnabledHatStyles() {
    this.constructHatStyleMap();
    this.notifier.notifyListeners(this.hatStyleMap);
  }

  private constructHatStyleMap() {
    const {
      shapeEnablement,
      colorEnablement,
      shapePenalties,
      colorPenalties,
      maxPenalty,
    } =
      this.extensionContext.extensionMode === vscode.ExtensionMode.Test
        ? this.getDefaultSettings()
        : this.getSettings();

    shapeEnablement.default = true;
    colorEnablement.default = true;
    shapePenalties.default = 0;
    colorPenalties.default = 0;

    const activeHatColors = HAT_COLORS.filter(
      (color) => colorEnablement[color],
    );
    const activeNonDefaultHatShapes = HAT_NON_DEFAULT_SHAPES.filter(
      (shape) => shapeEnablement[shape],
    );

    this.hatStyleMap = {
      ...Object.fromEntries(
        activeHatColors.map((color) => [
          color,
          { color, shape: "default", penalty: colorPenalties[color] },
        ]),
      ),
      ...Object.fromEntries(
        activeHatColors.flatMap((color) =>
          activeNonDefaultHatShapes.map((shape) => [
            `${color}-${shape}`,
            {
              color,
              shape,
              penalty: colorPenalties[color] + shapePenalties[shape],
            },
          ]),
        ),
      ),
    };

    if (maxPenalty > 0) {
      this.hatStyleMap = pickBy(
        this.hatStyleMap,
        ({ penalty }) => penalty <= maxPenalty,
      );
    }
  }

  private getSettings(): Settings {
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
    return {
      shapeEnablement,
      colorEnablement,
      shapePenalties,
      colorPenalties,
      maxPenalty,
    };
  }

  private getDefaultSettings(): Settings {
    return {
      shapeEnablement: {
        default: true,
        bolt: false,
        curve: false,
        fox: false,
        frame: false,
        play: false,
        wing: false,
        hole: false,
        ex: false,
        crosshairs: false,
        eye: false,
      },
      colorEnablement: {
        default: true,
        blue: true,
        green: true,
        red: true,
        pink: true,
        yellow: true,
        userColor1: false,
        userColor2: false,
        userColor3: false,
        userColor4: false,
      },
      shapePenalties: {
        default: 1,
        bolt: 1,
        curve: 1,
        fox: 1,
        frame: 1,
        play: 1,
        wing: 1,
        hole: 1,
        ex: 1,
        crosshairs: 1,
        eye: 1,
      },
      colorPenalties: {
        default: 1,
        blue: 1,
        green: 1,
        red: 1,
        pink: 1,
        yellow: 1,
        userColor1: 1,
        userColor2: 1,
        userColor3: 1,
        userColor4: 1,
      },
      maxPenalty: 0,
    };
  }
}
