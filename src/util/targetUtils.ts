import { zip } from "lodash";
import { Range, Selection, TextEditor } from "vscode";
import { getTokenContext } from "../processTargets/modifiers/scopeTypeStages/TokenStage";
import { Target } from "../typings/target.types";
import {
  SelectionContext,
  SelectionWithEditor,
  SelectionWithEditorWithContext,
} from "../typings/Types";
import { groupBy } from "./itertools";
import { isReversed } from "./selectionUtils";

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
  func: (editor: TextEditor, targets: Target[]) => Promise<T>
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

/** Get the possible leading and trailing overflow ranges of the outside range compared to the inside range */
export function getOutsideOverflow(
  editor: TextEditor,
  insideRange: Range,
  outsideRange: Range
): Range[] {
  const { start: insideStart, end: insideEnd } = insideRange;
  const { start: outsideStart, end: outsideEnd } = outsideRange;
  const result = [];
  if (outsideStart.isBefore(insideStart)) {
    result.push(new Range(outsideStart, insideStart));
  }
  if (outsideEnd.isAfter(insideEnd)) {
    result.push(new Range(insideEnd, outsideEnd));
  }
  return result;
}

export function getContentRange(target: Target) {
  return target.contentRange;
}

export function getContentText(target: Target) {
  return target.editor.document.getText(target.contentRange);
}

export function getContentSelection(target: Target) {
  return target.isReversed
    ? new Selection(target.contentRange.end, target.contentRange.start)
    : new Selection(target.contentRange.start, target.contentRange.end);
}

export function createThatMark(
  targets: Target[],
  ranges?: Range[]
): SelectionWithEditor[] {
  if (ranges) {
    return zip(targets, ranges).map(([target, range]) => ({
      editor: target!.editor,
      selection: target?.isReversed
        ? new Selection(range!.end, range!.start)
        : new Selection(range!.start, range!.end),
    }));
  }
  return targets.map((target) => ({
    editor: target!.editor,
    selection: getContentSelection(target),
  }));
}

export function getRemovalRange(target: Target) {
  return target.removal?.range ?? target.contentRange;
}

export function getRemovalHighlightRange(target: Target) {
  return target.removal?.highlightRange ?? getRemovalRange(target);
}

export function createRemovalRange(
  contentRange: Range,
  leadingDelimiterRange?: Range,
  trailingDelimiterRange?: Range
) {
  const delimiterRange = trailingDelimiterRange ?? leadingDelimiterRange;
  return delimiterRange != null
    ? contentRange.union(delimiterRange)
    : contentRange;
}

/** Possibly add delimiter for positions before/after */
export function maybeAddDelimiter(text: string, target: Target) {
  if (target.delimiter != null) {
    if (target.position === "before") {
      return text + target.delimiter;
    }
    if (target.position === "after") {
      return target.delimiter + text;
    }
  }
  return text;
}

export function isLineScopeType(target: Target) {
  switch (target.scopeType) {
    case "line":
    case "paragraph":
    case "document":
      return true;
    default:
      return false;
  }
}

export function selectionWithEditorWithContextToTarget(
  selection: SelectionWithEditorWithContext
): Target {
  // TODO Only use giving context in the future when all the containing scopes have proper delimiters.
  // For now fall back on token context
  const { context } = selection;
  const { containingListDelimiter, interiorRange, boundary } = context;
  const contentRange = selection.selection.selection;
  const newTarget = {
    editor: selection.selection.editor,
    isReversed: isReversed(contentRange),
    contentRange,
    interiorRange,
    boundary,
  };

  const tokenContext = useTokenContext(selection.context)
    ? getTokenContext(newTarget)
    : undefined;
  const leadingDelimiterRange =
    context.leadingDelimiterRange ??
    tokenContext?.removal.leadingDelimiterRange;
  const trailingDelimiterRange =
    context.trailingDelimiterRange ??
    tokenContext?.removal.trailingDelimiterRange;
  const removalRange =
    context.removalRange ??
    tokenContext?.removal?.range ??
    createRemovalRange(
      contentRange,
      leadingDelimiterRange,
      trailingDelimiterRange
    );
  const delimiter = tokenContext?.delimiter ?? containingListDelimiter ?? "\n";

  return {
    ...newTarget,
    delimiter,
    removal: {
      range: removalRange,
      leadingDelimiterRange,
      trailingDelimiterRange,
    },
  };
}

function useTokenContext(context: SelectionContext) {
  return (
    context.containingListDelimiter == null &&
    context.removalRange == null &&
    context.leadingDelimiterRange == null &&
    context.trailingDelimiterRange == null
  );
}
