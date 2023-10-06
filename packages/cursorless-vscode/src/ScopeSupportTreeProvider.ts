import { CursorlessCommandId, Disposer } from "@cursorless/common";
import {
  CustomSpokenFormGenerator,
  ScopeProvider,
  ScopeSupport,
  ScopeSupportLevels,
  ScopeTypeInfo,
} from "@cursorless/cursorless-engine";
import { VscodeApi } from "@cursorless/vscode-common";
import { isEqual } from "lodash";
import * as vscode from "vscode";
import { URI } from "vscode-uri";
import {
  ScopeVisualizer,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";

export const DONT_SHOW_TALON_UPDATE_MESSAGE_KEY = "dontShowUpdateTalonMessage";

export class ScopeSupportTreeProvider
  implements vscode.TreeDataProvider<MyTreeItem>
{
  private visibleDisposable: Disposer | undefined;
  private treeView: vscode.TreeView<MyTreeItem>;
  private supportLevels: ScopeSupportLevels = [];
  private shownUpdateTalonMessage = false;

  private _onDidChangeTreeData: vscode.EventEmitter<
    MyTreeItem | undefined | null | void
  > = new vscode.EventEmitter<MyTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    MyTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private vscodeApi: VscodeApi,
    private context: vscode.ExtensionContext,
    private scopeProvider: ScopeProvider,
    private scopeVisualizer: ScopeVisualizer,
    private customSpokenFormGenerator: CustomSpokenFormGenerator,
    private hasCommandServer: boolean,
  ) {
    this.treeView = vscodeApi.window.createTreeView("cursorless.scopeSupport", {
      treeDataProvider: this,
    });

    this.context.subscriptions.push(
      this.treeView,
      this.treeView.onDidChangeVisibility(this.onDidChangeVisible, this),
      this,
    );
  }

  static create(
    vscodeApi: VscodeApi,
    context: vscode.ExtensionContext,
    scopeProvider: ScopeProvider,
    scopeVisualizer: ScopeVisualizer,
    customSpokenFormGenerator: CustomSpokenFormGenerator,
    hasCommandServer: boolean,
  ): ScopeSupportTreeProvider {
    const treeProvider = new ScopeSupportTreeProvider(
      vscodeApi,
      context,
      scopeProvider,
      scopeVisualizer,
      customSpokenFormGenerator,
      hasCommandServer,
    );
    treeProvider.init();
    return treeProvider;
  }

  init() {
    if (this.treeView.visible) {
      this.registerScopeSupportListener();
    }
  }

  onDidChangeVisible(e: vscode.TreeViewVisibilityChangeEvent) {
    if (e.visible) {
      if (this.visibleDisposable != null) {
        return;
      }

      this.registerScopeSupportListener();
    } else {
      if (this.visibleDisposable == null) {
        return;
      }

      this.visibleDisposable.dispose();
      this.visibleDisposable = undefined;
    }
  }

  private registerScopeSupportListener() {
    this.visibleDisposable = new Disposer();
    this.visibleDisposable.push(
      this.scopeProvider.onDidChangeScopeSupport((supportLevels) => {
        this.supportLevels = supportLevels;
        this._onDidChangeTreeData.fire();
      }),
      this.scopeVisualizer.onDidChangeScopeType(() => {
        this._onDidChangeTreeData.fire();
      }),
    );
  }

  getTreeItem(element: MyTreeItem): MyTreeItem {
    return element;
  }

  getChildren(element?: MyTreeItem): MyTreeItem[] {
    if (element == null) {
      this.possiblyShowUpdateTalonMessage();
      return getSupportCategories();
    }

    if (element instanceof SupportCategoryTreeItem) {
      return this.getScopeTypesWithSupport(element.scopeSupport);
    }

    throw new Error("Unexpected element");
  }

  private async possiblyShowUpdateTalonMessage() {
    if (
      !this.customSpokenFormGenerator.needsInitialTalonUpdate ||
      this.shownUpdateTalonMessage ||
      !this.hasCommandServer ||
      (await this.context.globalState.get(DONT_SHOW_TALON_UPDATE_MESSAGE_KEY))
    ) {
      return;
    }

    this.shownUpdateTalonMessage = true;

    const result = await this.vscodeApi.window.showInformationMessage(
      "In order to see your custom spoken forms in the sidebar, you'll need to update your Cursorless Talon files.",
      "How?",
      "Don't show again",
    );

    if (result === "How?") {
      await this.vscodeApi.env.openExternal(
        URI.parse(
          "https://www.cursorless.org/docs/user/updating/#updating-the-talon-side",
        ),
      );
    } else if (result === "Don't show again") {
      await this.context.globalState.update(
        DONT_SHOW_TALON_UPDATE_MESSAGE_KEY,
        true,
      );
    }
  }

  getScopeTypesWithSupport(scopeSupport: ScopeSupport): ScopeSupportTreeItem[] {
    return this.supportLevels
      .filter(
        (supportLevel) =>
          supportLevel.support === scopeSupport &&
          (supportLevel.spokenForm.type !== "error" ||
            !supportLevel.spokenForm.isSecret),
      )
      .map(
        (supportLevel) =>
          new ScopeSupportTreeItem(
            supportLevel,
            isEqual(supportLevel.scopeType, this.scopeVisualizer.scopeType),
          ),
      )
      .sort((a, b) => {
        if (
          a.scopeTypeInfo.spokenForm.type !== b.scopeTypeInfo.spokenForm.type
        ) {
          return a.scopeTypeInfo.spokenForm.type === "error" ? 1 : -1;
        }

        if (
          a.scopeTypeInfo.isLanguageSpecific !==
          b.scopeTypeInfo.isLanguageSpecific
        ) {
          return a.scopeTypeInfo.isLanguageSpecific ? -1 : 1;
        }

        return a.label.label.localeCompare(b.label.label);
      });
  }

  dispose() {
    this.visibleDisposable?.dispose();
  }
}

function getSupportCategories(): SupportCategoryTreeItem[] {
  return [
    new SupportCategoryTreeItem(
      "Supported and present in editor",
      ScopeSupport.supportedAndPresentInEditor,
      vscode.TreeItemCollapsibleState.Expanded,
    ),
    new SupportCategoryTreeItem(
      "Supported but not present in editor",
      ScopeSupport.supportedButNotPresentInEditor,
      vscode.TreeItemCollapsibleState.Expanded,
    ),
    new SupportCategoryTreeItem(
      "Supported using legacy pathways",
      ScopeSupport.supportedLegacy,
      vscode.TreeItemCollapsibleState.Expanded,
    ),
    new SupportCategoryTreeItem(
      "Unsupported",
      ScopeSupport.unsupported,
      vscode.TreeItemCollapsibleState.Collapsed,
    ),
  ];
}

class ScopeSupportTreeItem extends vscode.TreeItem {
  public label: vscode.TreeItemLabel;

  /**
   * @param scopeTypeInfo The scope type info
   * @param isVisualized Whether the scope type is currently being visualized
    with the scope visualizer
   */
  constructor(
    public scopeTypeInfo: ScopeTypeInfo,
    isVisualized: boolean,
  ) {
    const label =
      scopeTypeInfo.spokenForm.type === "error"
        ? "-"
        : `"${scopeTypeInfo.spokenForm.preferred}"`;
    const description = scopeTypeInfo.humanReadableName;

    super(label, vscode.TreeItemCollapsibleState.None);

    const requiresTalonUpdate =
      scopeTypeInfo.spokenForm.type === "error" &&
      scopeTypeInfo.spokenForm.requiresTalonUpdate;

    this.label = {
      label,
      highlights: isVisualized ? [[0, label.length]] : [],
    };

    this.description = description;

    if (scopeTypeInfo.spokenForm.type === "success") {
      if (scopeTypeInfo.spokenForm.alternatives.length > 0) {
        this.tooltip = scopeTypeInfo.spokenForm.alternatives
          .map((spokenForm) => `"${spokenForm}"`)
          .join("\n");
      }
    } else if (requiresTalonUpdate) {
      this.tooltip = "Requires Talon update";
    } else {
      this.tooltip = "Spoken form disabled; see customization docs";
    }

    this.command = isVisualized
      ? {
          command:
            "cursorless.hideScopeVisualizer" satisfies CursorlessCommandId,
          title: "Hide the scope visualizer",
        }
      : {
          command:
            "cursorless.showScopeVisualizer" satisfies CursorlessCommandId,
          arguments: [
            scopeTypeInfo.scopeType,
            "content" satisfies VisualizationType,
          ],
          title: `Visualize ${scopeTypeInfo.humanReadableName}`,
        };

    if (scopeTypeInfo.isLanguageSpecific) {
      this.iconPath = new vscode.ThemeIcon("code");
    }
  }
}

class SupportCategoryTreeItem extends vscode.TreeItem {
  constructor(
    label: string,
    public readonly scopeSupport: ScopeSupport,
    collapsibleState: vscode.TreeItemCollapsibleState,
  ) {
    super(label, collapsibleState);
  }
}

type MyTreeItem = ScopeSupportTreeItem | SupportCategoryTreeItem;
