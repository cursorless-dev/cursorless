import * as vscode from "vscode";
import { Disposable } from "vscode";
import { HatRanges, Hats, HatStyleMap } from "../../libs/common/ide/types/Hats";
import { Listener, Notifier } from "../../libs/common/util/Notifier";
import VscodeAvailableHatStyles from "./VscodeAvailableHatStyles";
import VscodeHatRenderer from "./VscodeHatRenderer";

export class VscodeHats implements Hats {
  private _availableHatStyles: VscodeAvailableHatStyles;
  private hatRenderer: VscodeHatRenderer;
  isActive: boolean;
  private isActiveNotifier: Notifier<[boolean]> = new Notifier();

  constructor(extensionContext: vscode.ExtensionContext) {
    this._availableHatStyles = new VscodeAvailableHatStyles(extensionContext);
    this.hatRenderer = new VscodeHatRenderer(extensionContext);

    this.toggle = this.toggle.bind(this);

    this.isActive = vscode.workspace
      .getConfiguration("cursorless")
      .get<boolean>("showOnStart")!;

    extensionContext.subscriptions.push(
      vscode.commands.registerCommand(
        "cursorless.toggleDecorations",
        this.toggle,
      ),
    );
  }

  private toggle() {
    this.isActive = !this.isActive;
    this.isActiveNotifier.notifyListeners(this.isActive);
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

  onDidChangeIsActive(listener: Listener<[boolean]>): Disposable {
    return this.isActiveNotifier.registerListener(listener);
  }
}
