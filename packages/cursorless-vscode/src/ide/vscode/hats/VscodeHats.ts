import type {
  HatRange,
  Hats,
  HatStyleMap,
  HatStyleName,
  Listener,
  Range,
  TextEditor,
} from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import type { VscodeApi } from "@cursorless/vscode-common";
import { toVscodeRange } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { Disposable } from "vscode";
import type { VscodeHatStyleName } from "../hatStyles.types";
import VscodeEnabledHatStyleManager from "../VscodeEnabledHatStyleManager";
import type { VscodeIDE } from "../VscodeIDE";
import type { VscodeTextEditorImpl } from "../VscodeTextEditorImpl";
import type { FontMeasurements } from "./FontMeasurements";
import VscodeHatRenderer from "./VscodeHatRenderer";

export class VscodeHats implements Hats {
  private enabledHatStyleManager: VscodeEnabledHatStyleManager;
  private hatRenderer: VscodeHatRenderer;
  isEnabled: boolean;
  private isEnabledNotifier: Notifier<[boolean]> = new Notifier();
  private hatRanges: HatRange[] = [];

  constructor(
    private ide: VscodeIDE,
    vscodeApi: VscodeApi,
    extensionContext: vscode.ExtensionContext,
    fontMeasurements: FontMeasurements,
  ) {
    this.enabledHatStyleManager = new VscodeEnabledHatStyleManager(
      extensionContext,
    );
    this.hatRenderer = new VscodeHatRenderer(
      vscodeApi,
      extensionContext,
      ide.messages,
      this.enabledHatStyleManager,
      fontMeasurements,
    );

    this.toggle = this.toggle.bind(this);
    this.handleHatDecorationMapUpdated =
      this.handleHatDecorationMapUpdated.bind(this);
    this.recomputeDecorationStyles = this.recomputeDecorationStyles.bind(this);

    this.hatRenderer.registerListener(this.handleHatDecorationMapUpdated);

    this.isEnabled = vscode.workspace
      .getConfiguration("cursorless")
      .get<boolean>("showOnStart")!;
  }

  async init() {
    await this.hatRenderer.init();
  }

  toggle(isEnabled?: boolean) {
    this.isEnabled = isEnabled ?? !this.isEnabled;
    this.isEnabledNotifier.notifyListeners(this.isEnabled);
  }

  recomputeDecorationStyles() {
    return this.hatRenderer.forceRecomputeDecorationStyles();
  }

  private async handleHatDecorationMapUpdated() {
    if (
      this.hatRanges.some(
        ({ styleName }) => !(styleName in this.enabledHatStyles),
      )
    ) {
      // This happens if the user updated multiple settings simultaneously: one
      // that affects hat rendering and one that alters the set of available
      // hats. If the render setting notification fires first, then applying the
      // old hat decorations will fail, so we bail for now, knowing that the
      // notification for new hat allocations will come immediately after
      return;
    }

    await this.applyHatDecorations();
  }

  async setHatRanges(hatRanges: HatRange[]): Promise<void> {
    this.hatRanges = hatRanges;
    await this.applyHatDecorations();
  }

  private async applyHatDecorations(): Promise<void> {
    const hatStyleNames = Object.keys(this.enabledHatStyles);

    await this.hatRenderer.handleNewStylesIfNecessary();

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

    this.hatRanges.forEach(({ editor, range, styleName }) => {
      decorationRanges.get(editor)![styleName]!.push(range);
    });

    decorationRanges.forEach((ranges, editor) => {
      hatStyleNames.forEach((hatStyleName) => {
        (editor as VscodeTextEditorImpl).vscodeEditor.setDecorations(
          this.hatRenderer.getDecorationType(
            hatStyleName as VscodeHatStyleName,
          )!,
          ranges[hatStyleName]?.map((range) => toVscodeRange(range)) ?? [],
        );
      });
    });
  }

  get enabledHatStyles(): HatStyleMap {
    return this.enabledHatStyleManager.hatStyleMap;
  }

  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this.enabledHatStyleManager.registerListener(listener);
  }

  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable {
    return this.isEnabledNotifier.registerListener(listener);
  }
}
