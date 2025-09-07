import type {
  CursorlessCommandId,
  Range,
  ScopeProvider,
  ScopeRanges,
  ScopeSupportInfo,
  ScopeType,
  ScopeTypeInfo,
  Selection,
  TextEditor,
} from "@cursorless/common";
import {
  CURSORLESS_SCOPE_TREE_VIEW_ID,
  DOCS_URL,
  ScopeSupport,
  disposableFrom,
  serializeScopeType,
  uriEncodeHashId,
} from "@cursorless/common";
import {
  ide,
  type CustomSpokenFormGenerator,
} from "@cursorless/cursorless-engine";
import { fromVscodeSelection, type VscodeApi } from "@cursorless/vscode-common";
import { isEqual } from "lodash-es";
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
  extensions,
  window,
} from "vscode";
import { URI } from "vscode-uri";
import type {
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

  private onDidChangeVisible(e: TreeViewVisibilityChangeEvent) {
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
      this.vscodeApi.window.onDidChangeTextEditorSelection(() => {
        this._onDidChangeTreeData.fire();
      }),
    );
  }

  getTreeItem(element: MyTreeItem): MyTreeItem {
    return element;
  }

  getChildren(element?: MyTreeItem): MyTreeItem[] {
    if (element == null) {
      void this.possiblyShowUpdateTalonMessage();
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
        URI.parse(`${DOCS_URL}/user/updating/#updating-the-talon-side`),
      );
    } else if (result === DONT_SHOW_AGAIN_BUTTON_TEXT) {
      await this.context.globalState.update(
        DONT_SHOW_TALON_UPDATE_MESSAGE_KEY,
        true,
      );
    }
  }

  private getIntersectionIcon(
    editor: TextEditor,
    selection: Selection,
    scopeType: ScopeType,
  ): string | undefined {
    const scopes = this.scopeProvider.provideScopeRangesForRange(
      editor,
      scopeType,
      selection,
    );

    for (const scope of scopes) {
      for (const target of scope.targets) {
        // Scope target exactly matches selection
        if (target.contentRange.isRangeEqual(selection)) {
          return "🎯";
        }
        // Scope target contains selection
        if (target.contentRange.contains(selection)) {
          return "📦";
        }
      }
    }

    return undefined;
  }

  private getScopeTypesWithSupport(
    scopeSupport: ScopeSupport,
  ): ScopeSupportTreeItem[] {
    const getIntersectionIcon = (() => {
      if (scopeSupport !== ScopeSupport.supportedAndPresentInEditor) {
        return null;
      }
      const editor = ide().activeTextEditor;
      if (editor == null || editor.selections.length !== 1) {
        return null;
      }
      const selection = editor.selections[0];
      return (scopeType: ScopeType) => {
        return this.getIntersectionIcon(editor, selection, scopeType);
      };
    })();

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
      .map((supportLevel) => {
        const intersectionIcon = getIntersectionIcon?.(supportLevel.scopeType);
        return new ScopeSupportTreeItem(
          supportLevel,
          isEqual(supportLevel.scopeType, this.scopeVisualizer.scopeType),
          intersectionIcon,
        );
      })
      .sort((a, b) => {
        // Scopes with no spoken form are sorted to the bottom
        if (
          a.scopeTypeInfo.spokenForm.type !== b.scopeTypeInfo.spokenForm.type
        ) {
          return a.scopeTypeInfo.spokenForm.type === "error" ? 1 : -1;
        }

        // Then language-specific scopes are sorted to the top
        if (
          a.scopeTypeInfo.isLanguageSpecific !==
          b.scopeTypeInfo.isLanguageSpecific
        ) {
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
    new SupportCategoryTreeItem(ScopeSupport.unsupported),
  ];
}

class ScopeSupportTreeItem extends TreeItem {
  declare public readonly label: TreeItemLabel;
  public url: string | undefined;

  /**
   * @param scopeTypeInfo The scope type info
   * @param isVisualized Whether the scope type is currently being visualized
    with the scope visualizer
   */
  constructor(
    public readonly scopeTypeInfo: ScopeTypeInfo,
    isVisualized: boolean,
    intersectionIcon: string | undefined,
  ) {
    let label: string;
    let tooltip: string;

    if (scopeTypeInfo.spokenForm.type === "success") {
      label = scopeTypeInfo.spokenForm.spokenForms
        .map((spokenForm) => `"${spokenForm}"`)
        .join(" | ");
      tooltip = label;
    } else {
      label = "-";
      tooltip = scopeTypeInfo.spokenForm.requiresTalonUpdate
        ? `Requires Talon update; see [update instructions](${DOCS_URL}/user/updating/#updating-the-talon-side)`
        : `Spoken form disabled; see [customization docs](${DOCS_URL}/user/customization/#talon-side-settings)`;
    }

    super(
      {
        label,
        highlights: isVisualized ? [[0, label.length]] : [],
      },
      TreeItemCollapsibleState.None,
    );

    this.tooltip = tooltip == null ? tooltip : new MarkdownString(tooltip);
    this.description =
      intersectionIcon != null
        ? `${intersectionIcon} ${scopeTypeInfo.humanReadableName}`
        : scopeTypeInfo.humanReadableName;

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
      const languageId = window.activeTextEditor?.document.languageId;
      if (languageId != null) {
        const fileExtension =
          getLanguageExtensionSampleFromLanguageId(languageId);
        if (fileExtension != null) {
          this.resourceUri = URI.parse(
            "cursorless-dummy://dummy/dummy" + fileExtension,
          );
        }
        this.setUrl(languageId);
      }

      if (this.resourceUri == null) {
        // Fall back to a generic icon
        this.iconPath = new ThemeIcon("code");
      }
    } else {
      this.setUrl("plaintext");
    }
  }

  private setUrl(languageId: string) {
    const id = uriEncodeHashId(
      serializeScopeType(this.scopeTypeInfo.scopeType),
    );
    this.url = `${DOCS_URL}/user/languages/${languageId}#${id}`;
    this.contextValue = "scopeVisualizerTreeItem";
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

/**
 * Get file extension example from vscode [Language Id](https://code.visualstudio.com/docs/languages/identifiers)
 * Would've been easier with https://github.com/microsoft/vscode/issues/109919
 * Example:
 * - 'typescript' => '.ts'
 * FIXME: Maybe memoise?
 */
export function getLanguageExtensionSampleFromLanguageId(
  languageId: string,
): string | undefined {
  for (const extension of extensions.all) {
    const languages: { id: string; extensions: string[] }[] | undefined =
      extension.packageJSON?.contributes?.languages;

    if (!languages) {
      continue;
    }

    for (const contributedLanguage of languages) {
      if (contributedLanguage.id === languageId) {
        return contributedLanguage.extensions[0];
      }
    }
  }
}
