import type {
  Disposable,
  IDE,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { showError } from "@cursorless/common";
import type { ScopeProvider } from "@cursorless/cursorless-engine";
import { ScopeSupport } from "@cursorless/cursorless-engine";
import type {
  ScopeRangeType,
  ScopeVisualizerColorConfig,
} from "@cursorless/vscode-common";
import { vscodeApi } from "../../../vscodeApi";
import { VscodeScopeRenderer } from "./VscodeScopeRenderer";
import { getColorsFromConfig } from "./getColorsFromConfig";

/**
 * Base class for the different kinds of scope visualizer, eg content, removal,
 * iteration.
 */
export abstract class VscodeScopeVisualizer {
  protected renderer!: VscodeScopeRenderer;
  private scopeListenerDisposable!: Disposable;
  private disposables: Disposable[] = [];

  protected abstract registerListener(): Disposable;
  protected abstract getNestedScopeRangeType(): ScopeRangeType;
  protected abstract getScopeSupport(editor: TextEditor): ScopeSupport;

  constructor(
    private ide: IDE,
    protected scopeProvider: ScopeProvider,
    protected scopeType: ScopeType,
  ) {
    this.disposables.push(
      vscodeApi.workspace.onDidChangeConfiguration(
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

  /**
   * Checks if the scope type is supported in the active editor, and shows an
   * error if not.
   */
  private checkScopeSupport(): void {
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

  /** This function is called initially, as well as whenever color config changes */
  private initialize() {
    const colorConfig = vscodeApi.workspace
      .getConfiguration("cursorless.scopeVisualizer")
      .get<ScopeVisualizerColorConfig>("colors")!;

    this.renderer?.dispose();
    this.renderer = new VscodeScopeRenderer(
      getColorsFromConfig(colorConfig, "domain"),
      getColorsFromConfig(colorConfig, this.getNestedScopeRangeType()),
    );

    // Note that on color config change, we want to re-register the listener
    // so that the provider will call us again with the current scope ranges
    // so that we can re-render them with the new colors.
    this.scopeListenerDisposable?.dispose();
    this.scopeListenerDisposable = this.registerListener();
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
    this.renderer?.dispose();
    this.scopeListenerDisposable?.dispose();
  }
}
