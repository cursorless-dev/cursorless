import { Disposable } from "vscode";
import { HatRanges, Hats, HatStyleMap } from "../../libs/common/ide/types/Hats";
import { Listener } from "../../libs/common/util/Notifier";
import VscodeAvailableHatStyles from "./VscodeAvailableHatStyles";
import VscodeHatRenderer from "./VscodeHatRenderer";

export class VscodeHats implements Hats {
  private _availableHatStyles: VscodeAvailableHatStyles;
  private hatRenderer: VscodeHatRenderer;

  constructor(extensionContext: vscode.ExtensionContext) {
    this._availableHatStyles = new VscodeAvailableHatStyles(extensionContext);
    this.hatRenderer = new VscodeHatRenderer(extensionContext);
  }

  setHatRanges(hatRanges: HatRanges): Promise<void> {
    throw new Error("Method not implemented.");
  }

  get availableHatStyles(): HatStyleMap {
    return this._availableHatStyles.hatStyleMap;
  }

  onDidChangeAvailableHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this._availableHatStyles.registerListener(listener);
  }
}
