import {
  FlashStyle,
  Range,
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

abstract class BringMoveSwap {
  protected abstract decoration: {
    sourceStyle: FlashStyle;
    destinationStyle: FlashStyle;
    getSourceRangeCallback: (target: Target) => Promise<Range>;
  };

  constructor(
    private rangeUpdater: RangeUpdater,
    private type: ActionType,
  ) {}

  protected async decorateTargets(sources: Target[], destinations: Target[]) {
    await Promise.all([
      flashTargets(
        ide(),
        sources,
        this.decoration.sourceStyle,
        this.decoration.getSourceRangeCallback,
      ),
      flashTargets(ide(), destinations, this.decoration.destinationStyle),
    ]);
  }

  protected async getEditsBringMove(
    sources: Target[],
    destinations: Destination[],
  ): Promise<ExtendedEdit[]> {
    const usedSources: Target[] = [];
    const results: ExtendedEdit[] = [];
    const shouldJoinSources =
      sources.length !== destinations.length && destinations.length === 1;

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      let destination = destinations[i];
      if ((source == null || destination == null) && !shouldJoinSources) {
        throw new Error("Targets must have same number of args");
      }

      if (destination != null) {
        let text: string;
        if (shouldJoinSources) {
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
          text = await source.contentText;
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
        if (this.type === "bring") {
          results.push({
            edit: (await source.toDestination("to")).constructChangeEdit(
              await destination.target.contentText,
            ),
            editor: source.editor,
            originalTarget: source,
            isSource: true,
          });
        }
      }
    }

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
          const sourceEditSelectionInfos = await Promise.all(
            sourceEdits.map(async ({ edit: { range }, originalTarget }) =>
              getSelectionInfo(
                editor.document,
                range.toSelection(originalTarget.isReversed),
                RangeExpansionBehavior.closedClosed,
              ),
            ),
          );

          // Destinations should be openOpen, because they should grow to contain
          // the new text.
          const destinationEditSelectionInfos = await Promise.all(
            destinationEdits.map(({ edit: { range }, originalTarget }) =>
              getSelectionInfo(
                editor.document,
                range.toSelection(originalTarget.isReversed),
                RangeExpansionBehavior.openOpen,
              ),
            ),
          );

          const cursorSelectionInfos = await Promise.all(
            editor.selections.map((selection) =>
              getSelectionInfo(
                editor.document,
                selection,
                RangeExpansionBehavior.closedClosed,
              ),
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
    const getRange = async (target: Target) =>
      thatMark.find((t) => t.target === target)!.selection;
    return Promise.all([
      flashTargets(
        ide(),
        thatMark.filter(({ isSource }) => isSource).map(({ target }) => target),
        this.decoration.sourceStyle,
        getRange,
      ),
      flashTargets(
        ide(),
        thatMark
          .filter(({ isSource }) => !isSource)
          .map(({ target }) => target),
        this.decoration.destinationStyle,
        getRange,
      ),
    ]);
  }

  protected calculateMarksBringMove(markEntries: MarkEntry[]) {
    return {
      thatMark: markEntries.filter(({ isSource }) => !isSource),
      sourceMark: markEntries.filter(({ isSource }) => isSource),
    };
  }
}

function broadcastSource(sources: Target[], destinations: Destination[]) {
  if (sources.length === 1) {
    // If there is only one source target, expand it to same length as
    // destination target
    return Array(destinations.length).fill(sources[0]);
  }
  return sources;
}

export class Bring extends BringMoveSwap {
  decoration = {
    sourceStyle: FlashStyle.referenced,
    destinationStyle: FlashStyle.pendingModification0,
    getSourceRangeCallback: getContentRange,
  };

  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "bring");
    this.run = this.run.bind(this);
  }

  async run(
    sources: Target[],
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    sources = broadcastSource(sources, destinations);

    await this.decorateTargets(
      sources,
      destinations.map((d) => d.target),
    );

    const edits = await this.getEditsBringMove(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarksBringMove(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
  }
}

export class Move extends BringMoveSwap {
  decoration = {
    sourceStyle: FlashStyle.pendingDelete,
    destinationStyle: FlashStyle.pendingModification0,
    getSourceRangeCallback: getRemovalHighlightRange,
  };

  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "move");
    this.run = this.run.bind(this);
  }

  async run(
    sources: Target[],
    destinations: Destination[],
  ): Promise<ActionReturnValue> {
    sources = broadcastSource(sources, destinations);

    await this.decorateTargets(
      sources,
      destinations.map((d) => d.target),
    );

    const edits = await this.getEditsBringMove(sources, destinations);

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    const { thatMark, sourceMark } = this.calculateMarksBringMove(markEntries);

    await this.decorateThatMark(thatMark);

    return { thatSelections: thatMark, sourceSelections: sourceMark };
  }
}

export class Swap extends BringMoveSwap {
  decoration = {
    sourceStyle: FlashStyle.pendingModification1,
    destinationStyle: FlashStyle.pendingModification0,
    getSourceRangeCallback: getContentRange,
  };

  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, "swap");
    this.run = this.run.bind(this);
  }

  async run(
    targets1: Target[],
    targets2: Target[],
  ): Promise<ActionReturnValue> {
    await this.decorateTargets(targets1, targets2);

    const edits = this.getEditsSwap(targets1, targets2);

    const markEntries = await this.performEditsAndComputeThatMark(await edits);

    await this.decorateThatMark(markEntries);

    return { thatSelections: markEntries, sourceSelections: [] };
  }

  private async getEditsSwap(
    targets1: Target[],
    targets2: Target[],
  ): Promise<ExtendedEdit[]> {
    const results: ExtendedEdit[] = [];

    for (let i = 0; i < targets1.length; ++i) {
      const target1 = targets1[i];
      const target2 = targets2[i];
      if (target1 == null || target2 == null) {
        throw new Error("Targets must have same number of args");
      }

      // Add destination edit
      results.push({
        edit: (await target2.toDestination("to")).constructChangeEdit(
          await target1.contentText,
        ),
        editor: target2.editor,
        originalTarget: target2,
        isSource: false,
      });

      // Add source edit
      results.push({
        edit: (await target1.toDestination("to")).constructChangeEdit(
          await target2.contentText,
        ),
        editor: target1.editor,
        originalTarget: target1,
        isSource: true,
      });
    }

    return results;
  }
}

async function getRemovalHighlightRange(target: Target) {
  return await target.getRemovalHighlightRange();
}
