import { flatten, zip } from "lodash";
import { Range, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { displayPendingEditDecorationsForRanges } from "../util/editDisplayUtils";
import { setSelectionsWithoutFocusingEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, runOnTargetsForEachEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class CopyLines implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async runForEditor(editor: TextEditor, targets: Target[]) {
    const edits = targets.map((target) => {
      const delimiter = target.delimiter ?? "";
      const isLine = delimiter.includes("\n");

      const range = getEditRange(
        editor,
        target.contentRange,
        isLine,
        !this.isBefore
      );
      const padding = isLine
        ? getLinePadding(editor, range, !this.isBefore)
        : "";

      const contentText = target.contentText;
      const text = this.isBefore
        ? delimiter + padding + contentText
        : contentText + delimiter + padding;

      return {
        range,
        isReplace: this.isBefore,
        text,
        offset: delimiter.length + padding.length,
        length: contentText.length,
      };
    });

    const [updatedEditorSelections, updatedEditSelections, thatSelections] =
      await performEditsAndUpdateSelections(
        this.graph.rangeUpdater,
        editor,
        edits,
        [
          editor.selections,
          edits.map(({ range }) => new Selection(range.start, range.end)),
          targets.map(({ contentSelection }) => contentSelection),
        ]
      );

    setSelectionsWithoutFocusingEditor(editor, updatedEditorSelections);
    editor.revealRange(editor.selection);

    const sourceSelections = zip(edits, updatedEditSelections).map(
      ([edit, selection]) => {
        const startOffset = editor.document.offsetAt(selection!.start);
        const startIndex = this.isBefore
          ? startOffset + edit!.offset
          : startOffset - edit!.offset - edit!.length;
        const endIndex = startIndex + edit!.length;
        return new Selection(
          editor.document.positionAt(startIndex),
          editor.document.positionAt(endIndex)
        );
      }
    );

    return {
      sourceMark: createThatMark(targets, sourceSelections),
      thatMark: createThatMark(targets, thatSelections),
    };
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const results = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor)
    );

    await displayPendingEditDecorationsForRanges(
      results.flatMap((result) =>
        result.thatMark.map((that) => ({
          editor: that.editor,
          range: that.selection,
        }))
      ),
      this.graph.editStyles.justAdded.token
    );

    return {
      sourceMark: results.flatMap((result) => result.sourceMark),
      thatMark: results.flatMap((result) => result.thatMark),
    };
  }
}

export class CopyLinesUp extends CopyLines {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class CopyLinesDown extends CopyLines {
  constructor(graph: Graph) {
    super(graph, false);
  }
}

export function getLinePadding(
  editor: TextEditor,
  range: Range,
  isBefore: boolean
) {
  const line = editor.document.lineAt(isBefore ? range.start : range.end);
  const characterIndex = line.isEmptyOrWhitespace
    ? range.start.character
    : line.firstNonWhitespaceCharacterIndex;
  return line.text.slice(0, characterIndex);
}

export function getEditRange(
  editor: TextEditor,
  range: Range,
  isLine: boolean,
  isBefore: boolean
) {
  // In case of trialing whitespaces we need to go to the end of the line(not content)
  const editRange =
    isLine && !isBefore ? editor.document.lineAt(range.end).range : range;
  const position = isBefore ? editRange.start : editRange.end;
  return new Range(position, position);
}
