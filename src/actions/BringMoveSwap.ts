import { flatten } from "lodash";
import { DecorationRangeBehavior, Selection, TextEditor } from "vscode";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { EditWithRangeUpdater, Graph } from "../typings/Types";
import { selectionFromRange } from "../util/selectionUtils";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { getContentRange, runForEachEditor } from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

type ActionType = "bring" | "move" | "swap";

interface ExtendedEdit {
  edit: EditWithRangeUpdater;
  editor: TextEditor;
  isSource: boolean;
  originalTarget: Target;
}

interface MarkEntry {
  editor: TextEditor;
  selection: Selection;
  isSource: boolean;
  target: Target;
}

class BringMoveSwap implements Action {
  constructor(private graph: Graph, private type: ActionType) {
    this.run = this.run.bind(this);
  }

  private broadcastSource(sources: Target[], destinations: Target[]) {
    if (sources.length === 1 && this.type !== "swap") {
      // If there is only one source target, expand it to same length as
      // destination target
      return Array(destinations.length).fill(sources[0]);
    }
    return sources;
  }

  private getDecorationContext() {
    let sourceStyle;
    let getSourceRangeCallback;
    if (this.type === "bring") {
      sourceStyle = this.graph.editStyles.referenced;
      getSourceRangeCallback = getContentRange;
    } else if (this.type === "move") {
      sourceStyle = this.graph.editStyles.pendingDelete;
      getSourceRangeCallback = getRemovalRange;
    }
    // NB this.type === "swap"
    else {
      sourceStyle = this.graph.editStyles.pendingModification1;
      getSourceRangeCallback = getContentRange;
    }
    return {
      sourceStyle,
      destinationStyle: this.graph.editStyles.pendingModification0,
      getSourceRangeCallback,
    };
  }

  private async decorateTargets(sources: Target[], destinations: Target[]) {
    const decorationContext = this.getDecorationContext();
    await Promise.all([
      this.graph.editStyles.displayPendingEditDecorations(
        sources,
        decorationContext.sourceStyle,
        decorationContext.getSourceRangeCallback
      ),
      this.graph.editStyles.displayPendingEditDecorations(
        destinations,
        decorationContext.destinationStyle
      ),
    ]);
  }

  private getEdits(sources: Target[], destinations: Target[]): ExtendedEdit[] {
    const usedSources: Target[] = [];
    const results: ExtendedEdit[] = [];
    const zipSources =
      sources.length !== destinations.length &&
      destinations.length === 1 &&
      this.type !== "swap";

    sources.forEach((source, i) => {
      let destination = destinations[i];
      if ((source == null || destination == null) && !zipSources) {
        throw new Error("Targets must have same number of args");
      }

      if (destination != null) {
        let text: string;
        if (zipSources) {
          text = sources
            .map((source, i) => {
              const text = source.contentText;
              const delimiter =
                (destination.isRaw ? null : destination.insertionDelimiter) ??
                (source.isRaw ? null : source.insertionDelimiter);
              return i > 0 && delimiter != null ? delimiter + text : text;
            })
            .join("");
        } else {
          text = source.contentText;
        }
        // Add destination edit
        results.push({
          edit: destination.constructChangeEdit(text),
          editor: destination.editor,
          originalTarget: destination,
          isSource: false,
        });
      } else {
        destination = destinations[0];
      }

      // Add source edit
      // Prevent multiple instances of the same expanded source.
      if (!usedSources.includes(source)) {
        usedSources.push(source);
        if (this.type !== "move") {
          results.push({
            edit: source.constructChangeEdit(destination.contentText),
            editor: source.editor,
            originalTarget: source,
            isSource: true,
          });
        }
      }
    });

    if (this.type === "move") {
      // Unify overlapping targets.
      unifyRemovalTargets(usedSources).forEach((source) => {
        results.push({
          edit: source.constructRemovalEdit(),
          editor: source.editor,
          originalTarget: source,
          isSource: true,
        });
      });
    }

    return results;
  }

  private async performEditsAndComputeThatMark(
    edits: ExtendedEdit[]
  ): Promise<MarkEntry[]> {
    return flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          // For bring we don't want to update the sources
          const filteredEdits =
            this.type !== "bring"
              ? edits
              : edits.filter(({ isSource }) => !isSource);

          const editSelectionInfos = edits.map(({ originalTarget }) =>
            getSelectionInfo(
              editor.document,
              originalTarget.contentSelection,
              DecorationRangeBehavior.OpenOpen
            )
          );

          const cursorSelectionInfos = editor.selections.map((selection) =>
            getSelectionInfo(
              editor.document,
              selection,
              DecorationRangeBehavior.ClosedClosed
            )
          );

          const [updatedEditSelections, cursorSelections]: Selection[][] =
            await performEditsAndUpdateFullSelectionInfos(
              this.graph.rangeUpdater,
              editor,
              filteredEdits.map(({ edit }) => edit),
              [editSelectionInfos, cursorSelectionInfos]
            );

          setSelectionsWithoutFocusingEditor(editor, cursorSelections);

          return edits.map((edit, index): MarkEntry => {
            const selection = updatedEditSelections[index];
            const range = edit.edit.updateRange(selection);
            const target = edit.originalTarget;
            return {
              editor,
              selection: selectionFromRange(target.isReversed, range),
              isSource: edit.isSource,
              target,
            };
          });
        }
      )
    );
  }

  private async decorateThatMark(thatMark: MarkEntry[]) {
    const decorationContext = this.getDecorationContext();
    const getRange = (target: Target) =>
      thatMark.find((t) => t.target === target)!.selection;
    return Promise.all([
      this.graph.editStyles.displayPendingEditDecorations(
        thatMark.filter(({ isSource }) => isSource).map(({ target }) => target),
        decorationContext.sourceStyle,
        getRange
      ),
      this.graph.editStyles.displayPendingEditDecorations(
        thatMark
          .filter(({ isSource }) => !isSource)
          .map(({ target }) => target),
        decorationContext.destinationStyle,
        getRange
      ),
    ]);
  }

  private calculateMarks(markEntries: MarkEntry[]) {
    // Only swap has sources as a "that" mark
    const thatMark =
      this.type === "swap"
        ? markEntries
        : markEntries.filter(({ isSource }) => !isSource);

    // Only swap doesn't have a source mark
    const sourceMark =
      this.type === "swap"
        ? []
        : markEntries.filter(({ isSource }) => isSource);

    return { thatMark, sourceMark };
  }

  async run([sources, destinations]: [
    Target[],
    Target[]
  ]): Promise<ActionReturnValue> {
    sources = this.broadcastSource(sources, destinations);

    await this.decorateTargets(sources, destinations);

    const edits = this.getEdits(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarks(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatMark, sourceMark };
  }
}

export class Bring extends BringMoveSwap {
  constructor(graph: Graph) {
    super(graph, "bring");
  }
}

export class Move extends BringMoveSwap {
  constructor(graph: Graph) {
    super(graph, "move");
  }
}

export class Swap extends BringMoveSwap {
  constructor(graph: Graph) {
    super(graph, "swap");
  }
}

function getRemovalRange(target: Target) {
  return target.getRemovalRange();
}
