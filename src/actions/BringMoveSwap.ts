import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  Edit,
} from "../typings/Types";
import { runForEachEditor } from "../util/targetUtils";
import update from "immutability-helper";
import displayPendingEditDecorations from "../util/editDisplayUtils";
import { performOutsideAdjustment } from "../util/performInsideOutsideAdjustment";
import { flatten } from "lodash";
import { Selection, TextEditor, Range, DecorationRangeBehavior } from "vscode";

import {
  getTextWithPossibleDelimiter,
  maybeAddDelimiter,
} from "../util/getTextWithPossibleDelimiter";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";

type ActionType = "bring" | "move" | "swap";

interface ExtendedEdit extends Edit {
  editor: TextEditor;
  isSource: boolean;
  originalSelection: TypedSelection;
}

interface MarkEntry {
  editor: TextEditor;
  selection: Selection;
  isSource: boolean;
  typedSelection: TypedSelection;
}

class BringMoveSwap implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: null },
    { insideOutsideType: null },
  ];

  constructor(private graph: Graph, private type: ActionType) {
    this.run = this.run.bind(this);
  }

  private broadcastSource(
    sources: TypedSelection[],
    destinations: TypedSelection[]
  ) {
    if (sources.length === 1 && this.type !== "swap") {
      // If there is only one source target, expand it to same length as
      // destination target
      return Array(destinations.length).fill(sources[0]);
    }
    return sources;
  }

  private getDecorationStyles() {
    let sourceStyle;
    if (this.type === "bring") {
      sourceStyle = this.graph.editStyles.referenced;
    } else if (this.type === "move") {
      sourceStyle = this.graph.editStyles.pendingDelete;
    }
    // NB this.type === "swap"
    else {
      sourceStyle = this.graph.editStyles.pendingModification1;
    }
    return {
      sourceStyle,
      destinationStyle: this.graph.editStyles.pendingModification0,
    };
  }

  private async decorateTargets(
    sources: TypedSelection[],
    destinations: TypedSelection[]
  ) {
    const decorationTypes = this.getDecorationStyles();
    await Promise.all([
      displayPendingEditDecorations(sources, decorationTypes.sourceStyle),
      displayPendingEditDecorations(
        destinations,
        decorationTypes.destinationStyle
      ),
    ]);
  }

  private getEdits(
    sources: TypedSelection[],
    destinations: TypedSelection[]
  ): ExtendedEdit[] {
    const usedSources: TypedSelection[] = [];
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
              let text = source.selection.editor.document.getText(
                source.selection.selection
              );
              const selectionContext = destination.selectionContext
                .isRawSelection
                ? source.selectionContext
                : destination.selectionContext;
              return i > 0 && selectionContext.containingListDelimiter
                ? selectionContext.containingListDelimiter + text
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
          range: destination.selection.selection as Range,
          text,
          editor: destination.selection.editor,
          originalSelection: destination,
          isSource: false,
          isReplace: destination.position === "after",
        });
      } else {
        destination = destinations[0];
      }

      // Add source edit
      // Prevent multiple instances of the same expanded source.
      if (!usedSources.includes(source)) {
        usedSources.push(source);
        let text: string;
        let range: Range;

        if (this.type !== "move") {
          text = destination.selection.editor.document.getText(
            destination.selection.selection
          );
          range = source.selection.selection;
        }
        // NB: this.type === "move"
        else {
          text = "";
          source = performOutsideAdjustment(source);
          range = source.selection.selection;
        }

        results.push({
          range,
          text,
          editor: source.selection.editor,
          originalSelection: source,
          isSource: true,
          isReplace: false,
        });
      }
    });

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
              originalSelection.selection.selection,
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
              typedSelection: update(edit!.originalSelection, {
                selection: {
                  selection: { $set: selection! },
                },
              }),
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
    TypedSelection[],
    TypedSelection[]
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
