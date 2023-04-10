import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { flatten } from "lodash";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { EditWithRangeUpdater } from "../typings/Types";
import { Graph } from "../typings/Graph";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { flashTargets, getContentRange, runForEachEditor } from "../util/targetUtils";
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
    let sourceStyle: FlashStyle;
    let getSourceRangeCallback;
    if (this.type === "bring") {
      sourceStyle = FlashStyle.referenced;
      getSourceRangeCallback = getContentRange;
    } else if (this.type === "move") {
      sourceStyle = FlashStyle.pendingDelete;
      getSourceRangeCallback = getRemovalHighlightRange;
    }
    // NB this.type === "swap"
    else {
      sourceStyle = FlashStyle.pendingModification1;
      getSourceRangeCallback = getContentRange;
    }
    return {
      sourceStyle,
      destinationStyle: FlashStyle.pendingModification0,
      getSourceRangeCallback,
    };
  }

  private async decorateTargets(sources: Target[], destinations: Target[]) {
    const decorationContext = this.getDecorationContext();
    await Promise.all([
      flashTargets(
        ide(),
        sources,
        decorationContext.sourceStyle,
        decorationContext.getSourceRangeCallback,
      ),
      flashTargets(ide(), destinations, decorationContext.destinationStyle),
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
    edits: ExtendedEdit[],
  ): Promise<MarkEntry[]> {
    return flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          // For bring we don't want to update the sources
          const filteredEdits =
            this.type !== "bring" ? edits : edits.filter(({ isSource }) => !isSource);

          const editSelectionInfos = edits.map(({ edit: { range }, originalTarget }) =>
            getSelectionInfo(
              editor.document,
              range.toSelection(originalTarget.isReversed),
              RangeExpansionBehavior.openOpen,
            ),
          );

          const cursorSelectionInfos = editor.selections.map((selection) =>
            getSelectionInfo(
              editor.document,
              selection,
              RangeExpansionBehavior.closedClosed,
            ),
          );

          const editableEditor = ide().getEditableTextEditor(editor);

          const [updatedEditSelections, cursorSelections]: Selection[][] =
            await performEditsAndUpdateFullSelectionInfos(
              this.graph.rangeUpdater,
              editableEditor,
              filteredEdits.map(({ edit }) => edit),
              [editSelectionInfos, cursorSelectionInfos],
            );

          // NB: We set the selections here because we don't trust vscode to
          // properly move the cursor on a bring. Sometimes it will smear an
          // empty selection
          setSelectionsWithoutFocusingEditor(editableEditor, cursorSelections);

          return edits.map((edit, index): MarkEntry => {
            const selection = updatedEditSelections[index];
            const range = edit.edit.updateRange(selection);
            const target = edit.originalTarget;
            return {
              editor,
              selection: range.toSelection(target.isReversed),
              isSource: edit.isSource,
              target,
            };
          });
        },
      ),
    );
  }

  private async decorateThatMark(thatMark: MarkEntry[]) {
    const decorationContext = this.getDecorationContext();
    const getRange = (target: Target) =>
      thatMark.find((t) => t.target === target)!.selection;
    return Promise.all([
      flashTargets(
        ide(),
        thatMark.filter(({ isSource }) => isSource).map(({ target }) => target),
        decorationContext.sourceStyle,
        getRange,
      ),
      flashTargets(
        ide(),
        thatMark.filter(({ isSource }) => !isSource).map(({ target }) => target),
        decorationContext.destinationStyle,
        getRange,
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
      this.type === "swap" ? [] : markEntries.filter(({ isSource }) => isSource);

    return { thatMark, sourceMark };
  }

  async run([sources, destinations]: [Target[], Target[]]): Promise<ActionReturnValue> {
    sources = this.broadcastSource(sources, destinations);

    await this.decorateTargets(sources, destinations);

    const edits = this.getEdits(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarks(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
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

function getRemovalHighlightRange(target: Target) {
  return target.getRemovalHighlightRange();
}
