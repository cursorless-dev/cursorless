import { Position, Range, TextEditor } from "vscode";
import { Target } from "../typings/target.types";
import { groupBy } from "./itertools";

export function ensureSingleEditor(targets: Target[]) {
  if (targets.length === 0) {
    throw new Error("Require at least one target with this action");
  }

  const editors = targets.map((target) => target.editor);

  if (new Set(editors).size > 1) {
    throw new Error("Can only have one editor with this action");
  }

  return editors[0];
}

export function ensureSingleTarget(targets: Target[]) {
  if (targets.length !== 1) {
    throw new Error("Can only have one target with this action");
  }

  return targets[0];
}

export async function runForEachEditor<T, U>(
  targets: T[],
  getEditor: (target: T) => TextEditor,
  func: (editor: TextEditor, editorTargets: T[]) => Promise<U>
): Promise<U[]> {
  return Promise.all(
    groupForEachEditor(targets, getEditor).map(([editor, editorTargets]) =>
      func(editor, editorTargets)
    )
  );
}

export async function runOnTargetsForEachEditor<T>(
  targets: Target[],
  func: (editor: TextEditor, selections: Target[]) => Promise<T>
): Promise<T[]> {
  return runForEachEditor(targets, (target) => target.editor, func);
}

export function groupTargetsForEachEditor(targets: Target[]) {
  return groupForEachEditor(targets, (target) => target.editor);
}

export function groupForEachEditor<T>(
  targets: T[],
  getEditor: (target: T) => TextEditor
): [TextEditor, T[]][] {
  // Actually group by document and not editor. If the same document is open in multiple editors we want to perform all actions in one editor or an concurrency error will occur.
  const getDocument = (target: T) => getEditor(target).document;
  const editorMap = groupBy(targets, getDocument);
  return Array.from(editorMap.values(), (editorTargets) => {
    // Just pick any editor with the given document open; doesn't matter which
    const editor = getEditor(editorTargets[0]);
    return [editor, editorTargets];
  });
}

/** Get the possible leading and trailing overflow ranges of the outside target compared to the inside target */
export function getOutsideOverflow(
  insideTarget: Target,
  outsideTarget: Target
): Target[] {
  const { start: insideStart, end: insideEnd } = insideTarget.contentRange;
  const { start: outsideStart, end: outsideEnd } = outsideTarget.contentRange;
  const result = [];
  if (outsideStart.isBefore(insideStart)) {
    result.push(
      createTypeSelection(insideTarget.editor, outsideStart, insideStart)
    );
  }
  if (outsideEnd.isAfter(insideEnd)) {
    result.push(
      createTypeSelection(insideTarget.editor, insideEnd, outsideEnd)
    );
  }
  return result;
}

function createTypeSelection(
  editor: TextEditor,
  start: Position,
  end: Position
): Target {
  return {
    editor,
    contentRange: new Range(start, end),
    isReversed: false,
  };
}
