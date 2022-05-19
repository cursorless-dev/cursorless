import { zip } from "lodash";
import { Range, Selection, TextEditor } from "vscode";
import { getTokenDelimiters } from "../processTargets/modifiers/scopeTypeStages/TokenStage";
import {
  RemovalRange,
  ScopeType,
  Target,
  TargetParameters,
} from "../typings/target.types";
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
    selection: target.getContentSelection(),
  }));
}

export function getRemovalRange(target: Target) {
  return target.getRemovalRange();
}

export function getRemovalHighlightRange(target: Target) {
  return target.getRemovalHighlightRange();
}

export function parseRemovalRange(
  range?: RemovalRange
): Required<RemovalRange> | undefined {
  return range != null && !range.exclude
    ? {
        range: range.range,
        highlight: range.highlight ?? range.range,
        exclude: false,
      }
    : undefined;
}

export function isLineScopeType(scopeType?: ScopeType) {
  switch (scopeType) {
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
): TargetParameters {
  // TODO Only use giving context in the future when all the containing scopes have proper delimiters.
  // For now fall back on token context
  const { context } = selection;
  const {
    containingListDelimiter,
    interiorRange,
    boundary,
    removalRange,
    leadingDelimiterRange,
    trailingDelimiterRange,
  } = context;
  const { editor, selection: contentRange } = selection.selection;

  const tokenContext = useTokenContext(selection.context)
    ? getTokenDelimiters(editor, contentRange)
    : undefined;

  const leadingDelimiter =
    tokenContext?.leadingDelimiter != null
      ? tokenContext.leadingDelimiter
      : leadingDelimiterRange != null
      ? { range: leadingDelimiterRange }
      : undefined;

  const trailingDelimiter =
    tokenContext?.trailingDelimiter != null
      ? tokenContext.trailingDelimiter
      : trailingDelimiterRange != null
      ? { range: trailingDelimiterRange }
      : undefined;

  return {
    editor,
    isReversed: isReversed(contentRange),
    contentRange,
    interiorRange,
    boundary,
    delimiter: tokenContext?.delimiter ?? containingListDelimiter ?? "\n",
    removal: removalRange != null ? { range: removalRange } : undefined,
    leadingDelimiter,
    trailingDelimiter,
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
