import { zip } from "lodash";
import { Position, Range, Selection, TextEditor } from "vscode";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { Graph } from "../typings/Types";

interface TextInsertion {
  range: Range;
  text: string;
  delimiter: string;
}

export async function insertTextBefore(
  graph: Graph,
  editor: TextEditor,
  textInsertions: TextInsertion[]
) {
  return insertText(graph, editor, textInsertions, true);
}

export async function insertTextAfter(
  graph: Graph,
  editor: TextEditor,
  textInsertions: TextInsertion[]
) {
  return insertText(graph, editor, textInsertions, false);
}

async function insertText(
  graph: Graph,
  editor: TextEditor,
  textInsertions: TextInsertion[],
  isBefore: boolean
) {
  const edits = createEdits(editor, textInsertions, isBefore);
  const editSelections = edits.map(
    ({ range }) => new Selection(range.start, range.end)
  );
  const contentSelections = textInsertions.map(
    ({ range }) => new Selection(range.start, range.end)
  );

  const [
    updatedEditorSelections,
    updatedEditSelections,
    updatedContentSelections,
  ] = await performEditsAndUpdateSelections(graph.rangeUpdater, editor, edits, [
    editor.selections,
    editSelections,
    contentSelections,
  ]);

  const insertionRanges = zip(edits, updatedEditSelections).map(
    ([edit, selection]) => {
      const startOffset = editor.document.offsetAt(selection!.start);
      const startIndex = isBefore
        ? startOffset - edit!.offset - edit!.length
        : startOffset + edit!.offset;
      const endIndex = startIndex + edit!.length;
      return new Range(
        editor.document.positionAt(startIndex),
        editor.document.positionAt(endIndex)
      );
    }
  );

  return {
    updatedEditorSelections,
    updatedContentRanges: updatedContentSelections as Range[],
    insertionRanges,
  };
}

function createEdits(
  editor: TextEditor,
  textInsertions: TextInsertion[],
  isBefore: boolean
) {
  return textInsertions.map((insertion) => {
    const { range: contentRange, text, delimiter } = insertion;
    const isLine = delimiter.includes("\n");

    const range = getEditRange(editor, contentRange, isLine, isBefore);
    const padding = isLine ? getLinePadding(editor, range, isBefore) : "";

    const editText = isBefore
      ? text + delimiter + padding
      : delimiter + padding + text;

    return {
      range,
      isReplace: !isBefore,
      text: editText,
      offset: delimiter.length + padding.length,
      length: text.length,
    };
  });
}

function getLinePadding(editor: TextEditor, range: Range, isBefore: boolean) {
  const line = editor.document.lineAt(isBefore ? range.start : range.end);
  const characterIndex = line.isEmptyOrWhitespace
    ? range.start.character
    : line.firstNonWhitespaceCharacterIndex;
  return line.text.slice(0, characterIndex);
}

function getEditRange(
  editor: TextEditor,
  range: Range,
  isLine: boolean,
  isBefore: boolean
) {
  let position: Position;
  if (isLine) {
    const line = editor.document.lineAt(isBefore ? range.start : range.end);
    if (isBefore) {
      position = line.isEmptyOrWhitespace
        ? range.start
        : new Position(line.lineNumber, line.firstNonWhitespaceCharacterIndex);
    } else {
      position = line.range.end;
    }
  } else {
    position = isBefore ? range.start : range.end;
  }
  return new Range(position, position);
}
