import type {
  GeneralizedRange,
  Range,
  Selection,
  TextEditor,
} from "@cursorless/common";
import { FlashStyle, RangeExpansionBehavior } from "@cursorless/common";
import { flatten } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import type { EditWithRangeUpdater } from "../typings/Types";
import type { Destination, Target } from "../typings/target.types";
import {
  flashTargets,
  runForEachEditor,
  toGeneralizedRange,
} from "../util/targetUtils";
import { unifyRemovalTargets } from "../util/unifyRanges";
import type { ActionReturnValue } from "./actions.types";

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
    getSourceRangeCallback?: (target: Target) => GeneralizedRange;
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

  protected getEditsBringMove(
    sources: Target[],
    destinations: Destination[],
  ): ExtendedEdit[] {
    const usedSources: Target[] = [];
    const results: ExtendedEdit[] = [];
    const shouldJoinSources =
      sources.length !== destinations.length && destinations.length === 1;

    sources.forEach((source, i) => {
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
        // Allow move where the destination contains the source. eg "bring token to line"
        if (
          this.type !== "move" ||
          !destination.target.getRemovalRange().contains(source.contentRange)
        ) {
          usedSources.push(source);
        }
        if (this.type === "bring") {
          results.push({
            edit: source
              .toDestination("to")
              .constructChangeEdit(destination.target.contentText),
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

          const sourceEditRanges = sourceEdits.map(({ edit }) => edit.range);
          const destinationEditRanges = destinationEdits.map(
            ({ edit }) => edit.range,
          );
          const editableEditor = ide().getEditableTextEditor(editor);

          const {
            sourceEditRanges: updatedSourceEditRanges,
            destinationEditRanges: updatedDestinationEditRanges,
          } = await performEditsAndUpdateSelections({
            rangeUpdater: this.rangeUpdater,
            editor: editableEditor,
            edits: filteredEdits.map(({ edit }) => edit),
            selections: {
              // Sources should be closedClosed, because they should be logically
              // the same as the original source.
              sourceEditRanges,
              // Destinations should be openOpen, because they should grow to contain
              // the new text.
              destinationEditRanges: {
                selections: destinationEditRanges,
                behavior: RangeExpansionBehavior.openOpen,
              },
            },
          });

          const marks = [
            ...this.getMarks(sourceEdits, updatedSourceEditRanges),
            ...this.getMarks(destinationEdits, updatedDestinationEditRanges),
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

  private getMarks(edits: ExtendedEdit[], ranges: Range[]): MarkEntry[] {
    return edits.map((edit, index): MarkEntry => {
      const originalRange = ranges[index];
      const range = edit.edit.updateRange(originalRange);
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
    const getRange = (target: Target) => {
      return toGeneralizedRange(
        target,
        thatMark.find((t) => t.target === target)!.selection,
      );
    };
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

    const edits = this.getEditsBringMove(sources, destinations);

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

    const edits = this.getEditsBringMove(sources, destinations);

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

    const markEntries = await this.performEditsAndComputeThatMark(edits);

    await this.decorateThatMark(markEntries);

    return { thatSelections: markEntries, sourceSelections: [] };
  }

  private getEditsSwap(targets1: Target[], targets2: Target[]): ExtendedEdit[] {
    const results: ExtendedEdit[] = [];

    targets1.forEach((target1, i) => {
      const target2 = targets2[i];
      if (target1 == null || target2 == null) {
        throw new Error("Targets must have same number of args");
      }

      // Add destination edit
      results.push({
        edit: target2
          .toDestination("to")
          .constructChangeEdit(target1.contentText),
        editor: target2.editor,
        originalTarget: target2,
        isSource: false,
      });

      // Add source edit
      results.push({
        edit: target1
          .toDestination("to")
          .constructChangeEdit(target2.contentText),
        editor: target1.editor,
        originalTarget: target1,
        isSource: true,
      });
    });

    return results;
  }
}

function getRemovalHighlightRange(target: Target) {
  return target.getRemovalHighlightRange();
}
