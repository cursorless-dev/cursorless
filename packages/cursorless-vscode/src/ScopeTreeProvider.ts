import {
  CURSORLESS_SCOPE_TREE_VIEW_ID,
  CursorlessCommandId,
  ScopeProvider,
  ScopeSupport,
  ScopeSupportInfo,
  ScopeTypeInfo,
  disposableFrom,
} from "@cursorless/common";
import { CustomSpokenFormGenerator } from "@cursorless/cursorless-engine";
import { VscodeApi } from "@cursorless/vscode-common";
import { isEqual } from "lodash";
import type {
  Disposable,
  Event,
  ExtensionContext,
  TreeDataProvider,
  TreeItemLabel,
  TreeView,
  TreeViewVisibilityChangeEvent,
} from "vscode";
import {
  EventEmitter,
  MarkdownString,
  ThemeIcon,
  TreeItem,
  TreeItemCollapsibleState,
} from "vscode";
import { URI } from "vscode-uri";
import {
  ScopeVisualizer,
  VisualizationType,
} from "./ScopeVisualizerCommandApi";

export const DONT_SHOW_TALON_UPDATE_MESSAGE_KEY = "dontShowUpdateTalonMessage";

export class ScopeTreeProvider implements TreeDataProvider<MyTreeItem> {
  private visibleDisposable: Disposable | undefined;
  private treeView: TreeView<MyTreeItem>;
  private supportLevels: ScopeSupportInfo[] = [];
  private shownUpdateTalonMessage = false;

  private _onDidChangeTreeData: EventEmitter<
    MyTreeItem | undefined | null | void
  > = new EventEmitter<MyTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: Event<MyTreeItem | undefined | null | void> =
    this._onDidChangeTreeData.event;

  constructor(
    private vscodeApi: VscodeApi,
    private context: ExtensionContext,
    private scopeProvider: ScopeProvider,
    private scopeVisualizer: ScopeVisualizer,
    private customSpokenFormGenerator: CustomSpokenFormGenerator,
    private hasCommandServer: boolean,
  ) {
    this.treeView = vscodeApi.window.createTreeView(
      CURSORLESS_SCOPE_TREE_VIEW_ID,
      {
        treeDataProvider: this,
      },
    );

    this.context.subscriptions.push(
      this.treeView,
      this.treeView.onDidChangeVisibility(this.onDidChangeVisible, this),
      this,
    );

    if (this.treeView.visible) {
      this.registerScopeSupportListener();
    }
  }

  onDidChangeVisible(e: TreeViewVisibilityChangeEvent) {
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
    this.visibleDisposable = disposableFrom(
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

    const HOW_BUTTON_TEXT = "How?";
    const DONT_SHOW_AGAIN_BUTTON_TEXT = "Don't show again";
    const result = await this.vscodeApi.window.showInformationMessage(
      "In order to see your custom spoken forms in the sidebar, you'll need to update your Cursorless Talon files.",
      HOW_BUTTON_TEXT,
      DONT_SHOW_AGAIN_BUTTON_TEXT,
    );

    if (result === HOW_BUTTON_TEXT) {
      await this.vscodeApi.env.openExternal(
        URI.parse(
          "https://www.cursorless.org/docs/user/updating/#updating-the-talon-side",
        ),
      );
    } else if (result === DONT_SHOW_AGAIN_BUTTON_TEXT) {
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
          // Skip scope if it doesn't have a spoken form and it's private. That
          // is the default state for scopes that are private; we don't want to
          // show these to the user.
          !(
            supportLevel.spokenForm.type === "error" &&
            supportLevel.spokenForm.isPrivate
          ),
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
          // Scopes with no spoken form are sorted to the bottom
          return a.scopeTypeInfo.spokenForm.type === "error" ? 1 : -1;
        }

        if (
          a.scopeTypeInfo.isLanguageSpecific !==
          b.scopeTypeInfo.isLanguageSpecific
        ) {
          // Then language-specific scopes are sorted to the top
          return a.scopeTypeInfo.isLanguageSpecific ? -1 : 1;
        }

        // Then alphabetical by label
        return a.label.label.localeCompare(b.label.label);
      });
  }

  dispose() {
    this.visibleDisposable?.dispose();
  }
}

function getSupportCategories(): SupportCategoryTreeItem[] {
  return [
    new SupportCategoryTreeItem(ScopeSupport.supportedAndPresentInEditor),
    new SupportCategoryTreeItem(ScopeSupport.supportedButNotPresentInEditor),
    new SupportCategoryTreeItem(ScopeSupport.supportedLegacy),
    new SupportCategoryTreeItem(ScopeSupport.unsupported),
  ];
}

class ScopeSupportTreeItem extends TreeItem {
  public readonly label!: TreeItemLabel;

  /**
   * @param scopeTypeInfo The scope type info
   * @param isVisualized Whether the scope type is currently being visualized
    with the scope visualizer
   */
  constructor(
    public readonly scopeTypeInfo: ScopeTypeInfo,
    isVisualized: boolean,
  ) {
    let label: string;
    let tooltip: string | undefined;

    if (scopeTypeInfo.spokenForm.type === "success") {
      label = scopeTypeInfo.spokenForm.spokenForms
        .map((spokenForm) => `"${spokenForm}"`)
        .join(" | ");
    } else {
      label = "-";
      tooltip = scopeTypeInfo.spokenForm.requiresTalonUpdate
        ? "Requires Talon update; see [update instructions](https://www.cursorless.org/docs/user/updating/#updating-the-talon-side)"
        : "Spoken form disabled; see [customization docs](https://www.cursorless.org/docs/user/customization/#talon-side-settings)";
    }

    super(
      {
        label,
        highlights: isVisualized ? [[0, label.length]] : [],
      },
      TreeItemCollapsibleState.None,
    );

    this.tooltip = tooltip == null ? tooltip : new MarkdownString(tooltip);
    this.description = scopeTypeInfo.humanReadableName;

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
      this.iconPath = new ThemeIcon("code");
    }
  }
}

class SupportCategoryTreeItem extends TreeItem {
  constructor(public readonly scopeSupport: ScopeSupport) {
    let label: string;
    let description: string;
    let collapsibleState: TreeItemCollapsibleState;
    switch (scopeSupport) {
      case ScopeSupport.supportedAndPresentInEditor:
        label = "Present";
        description = "in active editor";
        collapsibleState = TreeItemCollapsibleState.Expanded;
        break;
      case ScopeSupport.supportedButNotPresentInEditor:
        label = "Supported";
        description = "but not present in active editor";
        collapsibleState = TreeItemCollapsibleState.Expanded;
        break;
      case ScopeSupport.supportedLegacy:
        label = "Legacy";
        description = "may or may not be present in active editor";
        collapsibleState = TreeItemCollapsibleState.Expanded;
        break;
      case ScopeSupport.unsupported:
        label = "Unsupported";
        description = "unsupported in language of active editor";
        collapsibleState = TreeItemCollapsibleState.Collapsed;
        break;
    }

    super(label, collapsibleState);
    this.description = description;
  }
}

type MyTreeItem = ScopeSupportTreeItem | SupportCategoryTreeItem;
