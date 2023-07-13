import {
  FlashDescriptor,
  FlashStyle,
  GeneralizedRange,
  groupBy,
  IDE,
  Range,
  Selection,
  TextEditor,
  toCharacterRange,
  toLineRange,
} from "@cursorless/common";
import { zip } from "lodash";
import { Destination, Target } from "../typings/target.types";
import { SelectionWithEditor } from "../typings/Types";

export function ensureSingleEditor(
  targets: Target[] | Destination[],
): TextEditor {
  if (targets.length === 0) {
    throw new Error("Require at least one target with this action");
  }

  const editors = targets.map((target) => target.editor);

  if (new Set(editors).size > 1) {
    throw new Error("Can only have one editor with this action");
  }

  return editors[0];
}

export function ensureSingleTarget<T extends Target | Destination>(
  targets: T[],
): T {
  if (targets.length !== 1) {
    throw new Error("Can only have one target with this action");
  }

  return targets[0];
}

export async function runForEachEditor<T, U>(
  targets: T[],
  getEditor: (target: T) => TextEditor,
  func: (editor: TextEditor, editorTargets: T[]) => Promise<U>,
): Promise<U[]> {
  return Promise.all(
    groupForEachEditor(targets, getEditor).map(([editor, editorTargets]) =>
      func(editor, editorTargets),
    ),
  );
}

export async function runOnTargetsForEachEditor<T>(
  targets: Target[],
  func: (editor: TextEditor, targets: Target[]) => Promise<T>,
): Promise<T[]> {
  return runForEachEditor(targets, (target) => target.editor, func);
}

export async function runOnTargetsForEachEditorSequentially<T>(
  targets: Target[],
  func: (editor: TextEditor, targets: Target[]) => Promise<T>,
): Promise<T[]> {
  const editorGroups = groupForEachEditor(targets, (target) => target.editor);
  const result: T[] = [];
  for (const [editor, targets] of editorGroups) {
    result.push(await func(editor, targets));
  }
  return result;
}

export function groupTargetsForEachEditor(targets: Target[]) {
  return groupForEachEditor(targets, (target) => target.editor);
}

function groupForEachEditor<T>(
  targets: T[],
  getEditor: (target: T) => TextEditor,
): [TextEditor, T[]][] {
  // Actually group by document and not editor. If the same document is open in multiple editors we want to perform all actions in one editor or an concurrency error will occur.
  const getDocumentUri = (target: T) => getEditor(target).document.uri;
  const editorMap = groupBy(targets, getDocumentUri);
  return Array.from(editorMap.values(), (editorTargets) => {
    // Just pick any editor with the given document open; doesn't matter which
    const editor = getEditor(editorTargets[0]);
    return [editor, editorTargets];
  });
}

export function getContentRange(target: Target) {
  return target.contentRange;
}

export function createThatMark(
  targets: Target[],
  ranges?: Range[],
): SelectionWithEditor[] {
  const thatMark =
    ranges != null
      ? zip(targets, ranges).map(([target, range]) => ({
          editor: target!.editor,
          selection: target?.isReversed
            ? new Selection(range!.end, range!.start)
            : new Selection(range!.start, range!.end),
        }))
      : targets.map((target) => ({
          editor: target!.editor,
          selection: target.contentSelection,
        }));
  return thatMark;
}

export function toGeneralizedRange(target: Target): GeneralizedRange {
  const range = target.contentRange;

  return target.isLine ? toLineRange(range) : toCharacterRange(range);
}

export function flashTargets(
  ide: IDE,
  targets: Target[],
  style: FlashStyle,
  getRange: (target: Target) => Range | undefined = getContentRange,
) {
  return ide.flashRanges(
    targets
      .map((target) => {
        const range = getRange(target);

        if (range == null) {
          return null;
        }

        return {
          editor: target.editor,
          range: target.isLine ? toLineRange(range) : toCharacterRange(range),
          style,
        };
      })
      .filter((flash): flash is FlashDescriptor => flash != null),
  );
}
