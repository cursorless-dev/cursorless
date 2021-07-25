import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
  Edit,
} from "../Types";
import { runForEachEditor } from "../targetUtils";
import update from "immutability-helper";
import displayPendingEditDecorations from "../editDisplayUtils";
import { performOutsideAdjustment } from "../performInsideOutsideAdjustment";
import { flatten, zip } from "lodash";
import { Selection, TextEditor, Range } from "vscode";
import { performEditsAndUpdateSelections } from "../updateSelections";
import { getTextWithPossibleDelimiter } from "../getTextWithPossibleDelimiter";

interface ExtendedEdit extends Edit {
  editor: TextEditor;
  isSource: boolean;
  originalSelection: TypedSelection;
}

interface ThatMarkEntry {
  editor: TextEditor;
  selection: Selection;
  isSource: boolean;
  typedSelection: TypedSelection;
}

class BringMoveSwap implements Action {
  targetPreferences: ActionPreferences[] = [
    { insideOutsideType: null },
    { insideOutsideType: null },
  ];

  constructor(private graph: Graph, private type: string) {
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
    return zip(sources, destinations).flatMap(([source, destination]) => {
      if (source == null || destination == null) {
        throw new Error("Targets must have same number of args");
      }

      // Get text adjusting for destination position
      const text = getTextWithPossibleDelimiter(source, destination);

      // Add destination edit
      const result = [
        {
          range: destination.selection.selection as Range,
          text,
          editor: destination.selection.editor,
          originalSelection: destination,
          isSource: false,
        },
      ];

      // Add source edit for move and swap
      // Prevent multiple instances of the same expanded source.
      if (this.type !== "bring" && !usedSources.includes(source)) {
        let text: string;
        let range: Range;

        if (this.type === "swap") {
          text = destination.selection.editor.document.getText(
            destination.selection.selection
          );
          range = source.selection.selection;
        }
        // NB: this.type === "move"
        else {
          text = "";
          range = performOutsideAdjustment(source).selection.selection;
        }

        usedSources.push(source);
        result.push({
          range,
          text,
          editor: source.selection.editor,
          originalSelection: source,
          isSource: true,
        });
      }

      return result;
    });
  }

  private async performEditsAndComputeThatMark(
    edits: ExtendedEdit[]
  ): Promise<ThatMarkEntry[]> {
    return flatten(
      await runForEachEditor(
        edits,
        (edit) => edit.editor,
        async (editor, edits) => {
          const [updatedSelections] = await performEditsAndUpdateSelections(
            editor,
            edits,
            [edits.map((edit) => edit.originalSelection.selection.selection)]
          );

          // Only swap has source as a "that" mark
          if (this.type !== "swap") {
            edits = edits.filter((edit) => !edit.isSource);
          }

          return edits.map((edit, index) => {
            const selection = updatedSelections[index];
            return {
              editor,
              selection,
              isSource: edit.isSource,
              typedSelection: update(edit.originalSelection, {
                selection: {
                  selection: { $set: selection },
                },
              }),
            };
          });
        }
      )
    );
  }

  private async decorateThatMark(thatMark: ThatMarkEntry[]) {
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

  async run([sources, destinations]: [
    TypedSelection[],
    TypedSelection[]
  ]): Promise<ActionReturnValue> {
    sources = this.broadcastSource(sources, destinations);

    await this.decorateTargets(sources, destinations);

    const edits = this.getEdits(sources, destinations);

    const thatMark = await this.performEditsAndComputeThatMark(edits);

    await this.decorateThatMark(thatMark);

    return { returnValue: null, thatMark };
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
