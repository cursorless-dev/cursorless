import {
  Disposable,
  IDE,
  ScopeType,
  TextEditor,
  showError,
} from "@cursorless/common";
import { ScopeProvider, ScopeSupport } from "@cursorless/cursorless-engine";
import {
  ScopeRangeType,
  ScopeVisualizerColorConfig,
} from "@cursorless/vscode-common";
import { getColorsFromConfig } from "./getColorsFromConfig";
import { VscodeScopeRenderer } from "./VscodeScopeRenderer";
import { Vscode } from "@cursorless/vscode-common";

export abstract class VscodeScopeVisualizer {
  protected renderer!: VscodeScopeRenderer;
  private scopeListenerDisposable!: Disposable;
  private disposables: Disposable[] = [];

  protected abstract registerListener(): Disposable;
  protected abstract getNestedScopeRangeType(): ScopeRangeType;
  protected abstract getScopeSupport(editor: TextEditor): ScopeSupport;

  constructor(
    private vscode: Vscode,
    private ide: IDE,
    protected scopeProvider: ScopeProvider,
    protected scopeType: ScopeType,
  ) {
    this.disposables.push(
      this.vscode.workspace.onDidChangeConfiguration(
        ({ affectsConfiguration }) => {
          if (affectsConfiguration("cursorless.scopeVisualizer.colors")) {
            this.initialize();
          }
        },
      ),
    );
  }

  start() {
    this.initialize();
    this.checkScopeSupport();
  }

  private checkScopeSupport() {
    const editor = this.ide.activeTextEditor;

    if (editor == null) {
      return;
    }

    switch (this.getScopeSupport(editor)) {
      case ScopeSupport.supportedAndPresentInEditor:
      case ScopeSupport.supportedButNotPresentInEditor:
        return;
      case ScopeSupport.supportedLegacy:
      case ScopeSupport.unsupported:
        showError(
          this.ide.messages,
          "ScopeVisualizer.scopeTypeNotSupported",
          `Scope type not supported for ${editor.document.languageId}, or only defined using legacy API which doesn't support visualization.  See https://www.cursorless.org/docs/contributing/adding-a-new-language/ for more about how to upgrade your language.`,
        );
    }
  }

  private initialize() {
    const colorConfig = this.vscode.workspace
      .getConfiguration("cursorless.scopeVisualizer")
      .get<ScopeVisualizerColorConfig>("colors")!;

    this.renderer?.dispose();
    this.renderer = new VscodeScopeRenderer(
      this.vscode,
      getColorsFromConfig(colorConfig, "domain"),
      getColorsFromConfig(colorConfig, this.getNestedScopeRangeType()),
    );

    // Reregister to cause the renderer to be updated with the new colors
    this.scopeListenerDisposable?.dispose();
    this.scopeListenerDisposable = this.registerListener();
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.renderer?.dispose();
    this.scopeListenerDisposable?.dispose();
  }
}
