import {
  Disposable,
  EditorScopeRanges,
  Range,
  ScopeRanges,
  ScopeType,
  TextEditor,
  showError,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { last } from "lodash";
import { VisualizationType } from "./VisualizationType";
import { Debouncer } from "./core/Debouncer";
import { ScopeHandlerFactory } from "./processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { ScopeHandler } from "./processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { ide } from "./singletons/ide.singleton";

interface VisualizationInfo {
  scopeType: ScopeType;
  visualizationType: VisualizationType;
}

export class ScopeVisualizer implements Disposable {
  private shownErrorMessages = new Set<string>();

  async setScopeType(visualizationInfo: VisualizationInfo | undefined) {
    this.visualizationInfo = visualizationInfo;
    // Clear highlights becasue VSCode seems to behave strangely when
    // changing the highlight type while highlights are active.  Would probably
    // be better to have this happen in VSCode-specific impl, but that's tricky
    // because the VSCode impl doesn't know about the visualization type.
    await this.clearHighlights();
    this.debouncer.run();
  }

  private disposables: Disposable[] = [];
  private debouncer = new Debouncer(() => this.highlightScopes());
  private visualizationInfo: VisualizationInfo | undefined = undefined;

  constructor(private scopeHandlerFactory: ScopeHandlerFactory) {
    this.disposables.push(
      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.debouncer.run),
      // An Event that fires when a text document closes
      ide().onDidCloseTextDocument(this.debouncer.run),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.debouncer.run),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.debouncer.run),
      ide().onDidChangeTextEditorVisibleRanges(this.debouncer.run),
      this.debouncer,
    );

    this.debouncer.run();
  }

  private async clearHighlights() {
    await ide().setScopeVisualizationRanges(
      ide().visibleTextEditors.map((editor) => ({ editor, scopeRanges: [] })),
    );
  }

  private getErrorSetKey(scopeType: ScopeType, languageId: string) {
    return `${JSON.stringify(scopeType)}:${languageId}`;
  }

  private async highlightScopes() {
    if (this.visualizationInfo == null) {
      return;
    }

    const editorScopeRanges: EditorScopeRanges[] = [];

    for (const editor of ide().visibleTextEditors) {
      const { document } = editor;

      const { scopeType, visualizationType } = this.visualizationInfo!;
      const scopeHandler = this.scopeHandlerFactory.create(
        scopeType,
        document.languageId,
      );

      if (scopeHandler == null) {
        const errorSetKey = this.getErrorSetKey(scopeType, document.languageId);
        if (!this.shownErrorMessages.has(errorSetKey)) {
          this.shownErrorMessages.add(errorSetKey);
          showError(
            ide().messages,
            "ScopeVisualizer.scopeTypeNotSupported",
            `Scope type not supported for ${document.languageId}, or only defined using legacy API which doesn't support visualization.  See https://www.cursorless.org/docs/contributing/adding-a-new-language/ for more about how to upgrade your language.`,
          );
        }
        editorScopeRanges.push({ editor, scopeRanges: [] });
        continue;
      }

      const iterationRange = getIterationRange(editor, scopeHandler);

      const scopes = Array.from(
        scopeHandler.generateScopes(editor, iterationRange.start, "forward", {
          includeDescendantScopes: true,
          distalPosition: iterationRange.end,
        }) ?? [],
      );

      editorScopeRanges.push({
        editor,
        scopeRanges: scopes.map((scope) => {
          const targets = scope.getTargets(false);
          const scopeRanges: ScopeRanges = {
            scopeType,
            domain: toCharacterRange(scope.domain),
          };

          switch (visualizationType) {
            case VisualizationType.content:
              scopeRanges.contentRanges = targets.map((target) =>
                toCharacterRange(target.contentRange),
              );
              break;
            case VisualizationType.removal:
              scopeRanges.removalRanges = targets.map((target) =>
                target.isLine
                  ? toLineRange(target.getRemovalHighlightRange())
                  : toCharacterRange(target.getRemovalHighlightRange()),
              );
              break;
          }

          return scopeRanges;
        }),
      });
    }

    await ide().setScopeVisualizationRanges(editorScopeRanges);
  }

  dispose(): void {
    this.disposables.forEach(({ dispose }) => {
      try {
        dispose();
      } catch (e) {
        // do nothing
      }
    });

    this.clearHighlights();
  }
}

/**
 * Get the range to iterate over for the given editor.  We take the union of all
 * visible ranges, add 10 lines either side to make scrolling a bit smoother,
 * and then expand to the largest ancestor of the start and end of the visible
 * range, so that we properly show nesting.
 * @param editor The editor to get the iteration range for
 * @param scopeHandler The scope handler to use
 * @returns The range to iterate over
 */
function getIterationRange(
  editor: TextEditor,
  scopeHandler: ScopeHandler,
): Range {
  let visibleRange = editor.visibleRanges.reduce((acc, range) =>
    acc.union(range),
  );

  visibleRange = editor.document.range.intersection(
    visibleRange.with(
      visibleRange.start.translate(-10),
      visibleRange.end.translate(10),
    ),
  )!;

  // Expand to largest ancestor of start of visible range FIXME: It's
  // possible that the removal range will be bigger than the domain range,
  // in which case we'll miss a scope if its removal range is visible but
  // its domain range is not.  I don't think we care that much; they can
  // scroll, and we have the extra 10 lines on either side which might help.
  const expandedStart =
    last(
      Array.from(
        scopeHandler.generateScopes(editor, visibleRange.start, "forward", {
          containment: "required",
        }),
      ),
    )?.domain ?? visibleRange;

  // Expand to largest ancestor of end of visible range
  const expandedEnd =
    last(
      Array.from(
        scopeHandler.generateScopes(editor, visibleRange.end, "forward", {
          containment: "required",
        }),
      ),
    )?.domain ?? visibleRange;

  return expandedStart.union(expandedEnd);
}
