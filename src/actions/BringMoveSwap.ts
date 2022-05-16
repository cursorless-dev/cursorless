import { flatten } from "lodash";
import { DecorationRangeBehavior, Selection, TextEditor } from "vscode";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { Target } from "../typings/target.types";
import { Edit, Graph } from "../typings/Types";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import {
  getContentRange,
  getContentSelection,
  getContentText,
  getRemovalRange,
  getTextWithPossibleDelimiter,
  maybeAddDelimiter,
  runForEachEditor,
} from "../util/targetUtils";
import { unifyTargets } from "../util/unifyRanges";
import { Action, ActionReturnValue } from "./actions.types";

type ActionType = "bring" | "move" | "swap";

interface ExtendedEdit extends Edit {
  editor: TextEditor;
  isSource: boolean;
  originalSelection: Target;
}

interface MarkEntry {
  editor: TextEditor;
  selection: Selection;
  isSource: boolean;
  typedSelection: Target;
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

  private getDecorationStyles() {
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
    const decorationTypes = this.getDecorationStyles();
    await Promise.all([
      displayPendingEditDecorations(
        sources,
        decorationTypes.sourceStyle,
        decorationTypes.getSourceRangeCallback
      ),
      displayPendingEditDecorations(
        destinations,
        decorationTypes.destinationStyle
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
              const text = getContentText(source);
              const containingListDelimiter =
                destination.delimiter ?? source.delimiter;
              return i > 0 && containingListDelimiter
                ? containingListDelimiter + text
                : text;
            })
            .join("");
          text = maybeAddDelimiter(text, destination);
        } else {
          // Get text adjusting for destination position
          text = getTextWithPossibleDelimiter(source, destination);
        }
        // Add destination edit
        results.push({
          range: destination.contentRange,
          text,
          editor: destination.editor,
          originalSelection: destination,
          isSource: false,
          isReplace:
            destination.position === "after" || destination.position === "end",
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
            range: source.contentRange,
            text: getContentText(destination),
            editor: source.editor,
            originalSelection: source,
            isSource: true,
            isReplace: false,
          });
        }
      }
    });

    if (this.type === "move") {
      // Unify overlapping targets.
      unifyTargets(usedSources).forEach((source) => {
        results.push({
          range: getRemovalRange(source),
          text: "",
          editor: source.editor,
          originalSelection: source,
          isSource: true,
          isReplace: false,
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

          const editSelectionInfos = edits.map(({ originalSelection }) =>
            getSelectionInfo(
              editor.document,
              getContentSelection(originalSelection),
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
              filteredEdits,
              [editSelectionInfos, cursorSelectionInfos]
            );

          editor.selections = cursorSelections;

          return edits.map((edit, index) => {
            const selection = updatedEditSelections[index];
            return {
              editor,
              selection,
              isSource: edit!.isSource,
              typedSelection: {
                ...edit!.originalSelection,
                contentRange: selection,
              },
            };
          });
        }
      )
    );
  }

  private async decorateThatMark(thatMark: MarkEntry[]) {
    const decorationTypes = this.getDecorationStyles();
    return Promise.all([
      displayPendingEditDecorations(
        thatMark
          .filter(({ isSource }) => isSource)
          .map(({ typedSelection }) => typedSelection),
        decorationTypes.sourceStyle
      ),
      displayPendingEditDecorations(
        thatMark
          .filter(({ isSource }) => !isSource)
          .map(({ typedSelection }) => typedSelection),
        decorationTypes.destinationStyle
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
