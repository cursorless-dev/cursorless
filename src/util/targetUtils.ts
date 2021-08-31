import { TextEditor, Selection, Position } from "vscode";
import { groupBy } from "./itertools";
import {
  PartialPrimitiveTarget,
  PartialRangeTarget,
  PartialTarget,
  TypedSelection,
} from "../typings/Types";

export function ensureSingleEditor(targets: TypedSelection[]) {
  if (targets.length === 0) {
    throw new Error("Require at least one target with this action");
  }

  const editors = targets.map((target) => target.selection.editor);

  if (new Set(editors).size > 1) {
    throw new Error("Can only have one editor with this action");
  }

  return editors[0];
}

export function ensureSingleTarget(targets: TypedSelection[]) {
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
  return await Promise.all(
    Array.from(groupBy(targets, getEditor), async ([editor, editorTargets]) =>
      func(editor, editorTargets)
    )
  );
}

export async function runOnTargetsForEachEditor<T>(
  targets: TypedSelection[],
  func: (editor: TextEditor, selections: TypedSelection[]) => Promise<T>
): Promise<T[]> {
  return runForEachEditor(targets, (target) => target.selection.editor, func);
}

/** Get the possible leading and trailing overflow ranges of the outside target compared to the inside target */
export function getOutsideOverflow(
  insideTarget: TypedSelection,
  outsideTarget: TypedSelection
): TypedSelection[] {
  const { start: insideStart, end: insideEnd } =
    insideTarget.selection.selection;
  const { start: outsideStart, end: outsideEnd } =
    outsideTarget.selection.selection;
  const result = [];
  if (outsideStart.isBefore(insideStart)) {
    result.push(
      createTypeSelection(
        insideTarget.selection.editor,
        outsideStart,
        insideStart
      )
    );
  }
  if (outsideEnd.isAfter(insideEnd)) {
    result.push(
      createTypeSelection(insideTarget.selection.editor, insideEnd, outsideEnd)
    );
  }
  return result;
}

function createTypeSelection(
  editor: TextEditor,
  start: Position,
  end: Position
): TypedSelection {
  return {
    selection: {
      editor,
      selection: new Selection(start, end),
    },
    selectionType: "token",
    selectionContext: {},
    insideOutsideType: "inside",
    position: "contents",
  };
}

/**
 * Given a list of targets, recursively descends all targets and returns every
 * contained primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function getPrimitiveTargets(targets: PartialTarget[]) {
  return targets.flatMap(getPrimitiveTargetsHelper);
}

function getPrimitiveTargetsHelper(
  target: PartialTarget
): PartialPrimitiveTarget[] {
  switch (target.type) {
    case "primitive":
      return [target];
    case "list":
      return target.elements.flatMap(getPrimitiveTargetsHelper);
    case "range":
      return [target.start, target.end];
  }
}

/**
 * Given a list of targets, recursively descends all targets and applies `func`
 * to every primitive target.
 *
 * @param targets The targets to extract from
 * @returns A list of primitive targets
 */
export function transformPrimitiveTargets(
  targets: PartialTarget[],
  func: (target: PartialPrimitiveTarget) => PartialPrimitiveTarget
) {
  return targets.map((target) => transformPrimitiveTargetsHelper(target, func));
}

function transformPrimitiveTargetsHelper(
  target: PartialTarget,
  func: (target: PartialPrimitiveTarget) => PartialPrimitiveTarget
): PartialTarget {
  switch (target.type) {
    case "primitive":
      return func(target);
    case "list":
      return {
        ...target,
        elements: target.elements.map(
          (element) =>
            transformPrimitiveTargetsHelper(element, func) as
              | PartialPrimitiveTarget
              | PartialRangeTarget
        ),
      };
    case "range":
      return { ...target, start: func(target.start), end: func(target.end) };
  }
}
