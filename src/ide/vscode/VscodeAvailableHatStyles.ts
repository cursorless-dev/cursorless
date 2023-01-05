import { pickBy } from "lodash";
import * as vscode from "vscode";
import { HatStyleInfo, HatStyleMap } from "../../libs/common/ide/types/Hats";
import { Listener, Notifier } from "../../libs/common/util/Notifier";
import isTesting from "../../testUtil/isTesting";
import {
  HatColor,
  HatShape,
  HAT_COLORS,
  HAT_NON_DEFAULT_SHAPES,
  VscodeHatStyleName,
} from "./hatStyles.types";

export interface ExtendedHatStyleInfo extends HatStyleInfo {
  color: HatColor;
  shape: HatShape;
}

export type ExtendedHatStyleMap = Partial<
  Record<VscodeHatStyleName, ExtendedHatStyleInfo>
>;

export default class VscodeAvailableHatStyles {
  hatStyleMap!: ExtendedHatStyleMap;
  private notifier: Notifier<[HatStyleMap]> = new Notifier();

  constructor(extensionContext: vscode.ExtensionContext) {
    this.recomputeAvailableHatStyles =
      this.recomputeAvailableHatStyles.bind(this);

    extensionContext.subscriptions.push(
      // Don't use fine grained settings here until tokenizer has migrated to graph
      vscode.workspace.onDidChangeConfiguration(
        this.recomputeAvailableHatStyles,
      ),
    );

    this.constructHatStyleMap();
  }

  registerListener(listener: Listener<[HatStyleMap]>) {
    return this.notifier.registerListener(listener);
  }

  private async recomputeAvailableHatStyles() {
    this.constructHatStyleMap();
    this.notifier.notifyListeners(this.hatStyleMap);
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
    } as ExtendedHatStyleMap;

    if (maxPenalty > 0) {
      this.hatStyleMap = pickBy(
        this.hatStyleMap,
        ({ penalty }) => penalty <= maxPenalty,
      );
    }
  }
}
