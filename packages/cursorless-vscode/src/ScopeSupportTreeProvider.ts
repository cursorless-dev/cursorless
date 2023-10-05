import { CursorlessCommandId } from "@cursorless/common";
import {
  ScopeProvider,
  ScopeSupport,
  ScopeSupportLevels,
  ScopeTypeInfo,
} from "@cursorless/cursorless-engine";
import * as vscode from "vscode";
import { VisualizationType } from "./ScopeVisualizerCommandApi";

export class ScopeSupportTreeProvider
  implements vscode.TreeDataProvider<MyTreeItem>
{
  private onDidChangeScopeSupportDisposable: vscode.Disposable | undefined;
  private treeView: vscode.TreeView<MyTreeItem>;
  private supportLevels: ScopeSupportLevels = [];

  private _onDidChangeTreeData: vscode.EventEmitter<
    MyTreeItem | undefined | null | void
  > = new vscode.EventEmitter<MyTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    MyTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  constructor(
    private context: vscode.ExtensionContext,
    private scopeProvider: ScopeProvider,
  ) {
    this.treeView = vscode.window.createTreeView("cursorlessScopeSupport", {
      treeDataProvider: this,
    });

    this.context.subscriptions.push(
      this.treeView,
      this.treeView.onDidChangeVisibility(this.onDidChangeVisible, this),
      this,
    );
  }

  static create(
    context: vscode.ExtensionContext,
    scopeProvider: ScopeProvider,
  ): ScopeSupportTreeProvider {
    const treeProvider = new ScopeSupportTreeProvider(context, scopeProvider);
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
      if (this.onDidChangeScopeSupportDisposable != null) {
        return;
      }

      this.registerScopeSupportListener();
    } else {
      if (this.onDidChangeScopeSupportDisposable == null) {
        return;
      }

      this.onDidChangeScopeSupportDisposable.dispose();
      this.onDidChangeScopeSupportDisposable = undefined;
    }
  }

  private registerScopeSupportListener() {
    this.onDidChangeScopeSupportDisposable =
      this.scopeProvider.onDidChangeScopeSupport((supportLevels) => {
        this.supportLevels = supportLevels;
        this._onDidChangeTreeData.fire();
      });
  }

  getTreeItem(element: MyTreeItem): MyTreeItem {
    return element;
  }

  getChildren(element?: MyTreeItem): MyTreeItem[] {
    if (element == null) {
      return getSupportCategories();
    }

    if (element instanceof SupportCategoryTreeItem) {
      return this.getScopeTypesWithSupport(element.scopeSupport);
    }

    throw new Error("Unexpected element");
  }

  getScopeTypesWithSupport(scopeSupport: ScopeSupport): ScopeSupportTreeItem[] {
    return this.supportLevels
      .filter((supportLevel) => supportLevel.support === scopeSupport)
      .map((supportLevel) => new ScopeSupportTreeItem(supportLevel))
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

        return a.label.localeCompare(b.label);
      });
  }

  dispose() {
    this.onDidChangeScopeSupportDisposable?.dispose();
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
  public label: string;

  constructor(public scopeTypeInfo: ScopeTypeInfo) {
    const label =
      scopeTypeInfo.spokenForm.type === "error"
        ? "-"
        : `"${scopeTypeInfo.spokenForm.preferred}"`;
    const description = scopeTypeInfo.humanReadableName;

    super(label, vscode.TreeItemCollapsibleState.None);

    this.label = label;

    this.description = description;

    if (
      scopeTypeInfo.spokenForm.type === "success" &&
      scopeTypeInfo.spokenForm.alternatives.length > 0
    ) {
      this.tooltip = scopeTypeInfo.spokenForm.alternatives
        .map((spokenForm) => `"${spokenForm}"`)
        .join("\n");
    }

    this.command = {
      command: "cursorless.showScopeVisualizer" satisfies CursorlessCommandId,
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
