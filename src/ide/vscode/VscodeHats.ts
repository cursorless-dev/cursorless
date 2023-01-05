import { Range, TextEditor } from "@cursorless/common";
import * as vscode from "vscode";
import { Disposable } from "vscode";
import { HatRange, Hats, HatStyleMap } from "../../libs/common/ide/types/Hats";
import { HatStyleName } from "../../libs/common/ide/types/hatStyles.types";
import { Listener, Notifier } from "../../libs/common/util/Notifier";
import { toVscodeRange } from "../../libs/vscode-common/vscodeUtil";
import { VscodeHatStyleName } from "./hatStyles.types";
import VscodeAvailableHatStyles from "./VscodeAvailableHatStyles";
import VscodeHatDecorationMap from "./VscodeHatDecorationMap";
import type VscodeIDE from "./VscodeIDE";
import { VscodeTextEditorImpl } from "./VscodeTextEditorImpl";

export class VscodeHats implements Hats {
  private _availableHatStyles: VscodeAvailableHatStyles;
  private hatDecorationMap: VscodeHatDecorationMap;
  isActive: boolean;
  private isActiveNotifier: Notifier<[boolean]> = new Notifier();

  constructor(
    private ide: VscodeIDE,
    extensionContext: vscode.ExtensionContext,
  ) {
    this._availableHatStyles = new VscodeAvailableHatStyles(extensionContext);
    this.hatDecorationMap = new VscodeHatDecorationMap(
      extensionContext,
      this._availableHatStyles,
    );

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

  async init() {
    await this.hatDecorationMap.init();
  }

  private toggle() {
    this.isActive = !this.isActive;
    this.isActiveNotifier.notifyListeners(this.isActive);
  }

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {
    const hatStyleNames = Object.keys(this.availableHatStyles);

    const decorationRanges: Map<
      TextEditor,
      {
        [decorationName in HatStyleName]?: Range[];
      }
    > = new Map(
      this.ide.visibleTextEditors.map((editor) => [
        editor,
        Object.fromEntries(hatStyleNames.map((name) => [name, []])),
      ]),
    );

    hatRanges.forEach(({ editor, range, styleName }) => {
      decorationRanges.get(editor)![styleName]!.push(range);
    });

    decorationRanges.forEach((ranges, editor) => {
      hatStyleNames.forEach((hatStyleName) => {
        (editor as VscodeTextEditorImpl).vscodeEditor.setDecorations(
          this.hatDecorationMap.getHatDecoration(
            hatStyleName as VscodeHatStyleName,
          )!,
          ranges[hatStyleName]?.map((range) => toVscodeRange(range)) ?? [],
        );
      });
    });
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
