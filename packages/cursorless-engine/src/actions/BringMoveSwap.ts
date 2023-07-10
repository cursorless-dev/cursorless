import {
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { flatten } from "lodash";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import {
  getSelectionInfo,
  performEditsAndUpdateFullSelectionInfos,
} from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { EditWithRangeUpdater } from "../typings/Types";
import { Destination, Target } from "../typings/target.types";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import {
  flashTargets,
  getContentRange,
  runForEachEditor,
} from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import { ActionReturnValue } from "./actions.types";

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

class BringMoveSwap {
  constructor(private rangeUpdater: RangeUpdater, private type: ActionType) {
    // this.run = this.run.bind(this);
  }

  protected broadcastSource(sources: Target[], destinations: Destination[]) {
    if (sources.length === 1) {
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

  protected async decorateTargets(sources: Target[], destinations: Target[]) {
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

  protected getEditsBringMove(
    sources: Target[],
    destinations: Destination[],
  ): ExtendedEdit[] {
    const usedSources: Target[] = [];
    const results: ExtendedEdit[] = [];
    const zipSources =
      sources.length !== destinations.length && destinations.length === 1;

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
          originalTarget: destination.target,
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
            edit: source.constructChangeEdit(destination.target.contentText),
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

  protected async performEditsAndComputeThatMark(
    edits: ExtendedEdit[],
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

          const sourceEdits =
            this.type === "swap"
              ? []
              : edits.filter(({ isSource }) => isSource);
          const destinationEdits =
            this.type === "swap"
              ? edits
              : edits.filter(({ isSource }) => !isSource);

          // Sources should be closedClosed, because they should be logically
          // the same as the original source.
          const sourceEditSelectionInfos = sourceEdits.map(
            ({ edit: { range }, originalTarget }) =>
              getSelectionInfo(
                editor.document,
                range.toSelection(originalTarget.isReversed),
                RangeExpansionBehavior.closedClosed,
              ),
          );

          // Destinations should be openOpen, because they should grow to contain
          // the new text.
          const destinationEditSelectionInfos = destinationEdits.map(
            ({ edit: { range }, originalTarget }) =>
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

          const [
            updatedSourceEditSelections,
            updatedDestinationEditSelections,
            cursorSelections,
          ]: Selection[][] = await performEditsAndUpdateFullSelectionInfos(
            this.rangeUpdater,
            editableEditor,
            filteredEdits.map(({ edit }) => edit),
            [
              sourceEditSelectionInfos,
              destinationEditSelectionInfos,
              cursorSelectionInfos,
            ],
          );

          // NB: We set the selections here because we don't trust vscode to
          // properly move the cursor on a bring. Sometimes it will smear an
          // empty selection
          setSelectionsWithoutFocusingEditor(editableEditor, cursorSelections);

          const marks = [
            ...this.getMarks(sourceEdits, updatedSourceEditSelections),
            ...this.getMarks(
              destinationEdits,
              updatedDestinationEditSelections,
            ),
          ];

          // Restore original order before split into source and destination
          marks.sort(
            (a, b) =>
              edits.findIndex((e) => e.originalTarget === a.target) -
              edits.findIndex((e) => e.originalTarget === b.target),
          );

          return marks;
        },
      ),
    );
  }

  private getMarks(
    edits: ExtendedEdit[],
    selections: Selection[],
  ): MarkEntry[] {
    return edits.map((edit, index): MarkEntry => {
      const selection = selections[index];
      const range = edit.edit.updateRange(selection);
      const target = edit.originalTarget;
      return {
        editor: edit.editor,
        selection: range.toSelection(target.isReversed),
        isSource: edit.isSource,
        target,
      };
    });
  }

  protected async decorateThatMark(thatMark: MarkEntry[]) {
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
        thatMark
          .filter(({ isSource }) => !isSource)
          .map(({ target }) => target),
        decorationContext.destinationStyle,
        getRange,
      ),
    ]);
  }

  protected calculateMarks(markEntries: MarkEntry[]) {
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
}

export class Bring extends BringMoveSwap {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "bring");
  }

  async run(
    sources: Target[],
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    sources = this.broadcastSource(sources, destinations);

    await this.decorateTargets(
      sources,
      destinations.map((d) => d.target),
    );

    const edits = this.getEditsBringMove(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarks(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
  }
}

export class Move extends BringMoveSwap {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "move");
  }

  async run(
    sources: Target[],
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    sources = this.broadcastSource(sources, destinations);

    await this.decorateTargets(
      sources,
      destinations.map((d) => d.target),
    );

    const edits = this.getEditsBringMove(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarks(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
  }
}

export class Swap extends BringMoveSwap {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "swap");
  }

  async run(
    targets1: Target[],
    targets2: Target[],
  ): Promise<ActionReturnValue> {
    await this.decorateTargets(targets1, targets2);

    const edits = this.getEditsSwap(targets1, targets2);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarks(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
  }

  private getEditsSwap(targets1: Target[], targets2: Target[]): ExtendedEdit[] {
    const results: ExtendedEdit[] = [];

    targets1.forEach((source, i) => {
      const destination = targets2[i];
      if (source == null || destination == null) {
        throw new Error("Targets must have same number of args");
      }

      // Add destination edit
      results.push({
        edit: destination.constructChangeEdit(source.contentText),
        editor: destination.editor,
        originalTarget: destination,
        isSource: false,
      });

      // Add source edit
      results.push({
        edit: source.constructChangeEdit(destination.contentText),
        editor: source.editor,
        originalTarget: source,
        isSource: true,
      });
    });

    return results;
  }
}

function getRemovalHighlightRange(target: Target) {
  return target.getRemovalHighlightRange();
}
