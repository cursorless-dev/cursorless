import * as vscode from "vscode";
import { Selection } from "vscode";
import {
  Mark,
  Position,
  PrimitiveTarget,
  ProcessedTargetsContext,
  SelectionType,
  SelectionWithUri,
  Target,
  Transformation,
  TypedSelection,
} from "./Types";

export default function processTargets(
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) => {
    switch (target.type) {
      case "list":
      case "range":
        throw new Error("Not implemented");
      case "primitive":
        return processSinglePrimitiveTarget(context, target);
    }
  });
}

function processSinglePrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget
): TypedSelection[] {
  const markSelections = getSelectionsFromMark(context, target.mark);
  const transformedSelections = markSelections.map((markSelection) =>
    transformSelection(context, target.transformation, markSelection)
  );
  const typedSelections = transformedSelections.map((selection) =>
    createTypedSelection(context, target.selectionType, selection)
  );
  return typedSelections.map((selection) =>
    performPositionAdjustment(context, target.position, selection)
  );
}

function getSelectionsFromMark(
  context: ProcessedTargetsContext,
  mark: Mark
): SelectionWithUri[] {
  switch (mark.type) {
    case "cursor":
      return context.currentSelections;
    case "decoratedSymbol":
      const token = context.navigationMap.getToken(
        mark.symbolColor,
        mark.character
      );
      return [
        {
          selection: new Selection(token.range.start, token.range.end),
          documentUri: token.documentUri,
        },
      ];
    case "lastCursorPosition":
    case "lastEditRange":
      throw new Error("Not implemented");
  }
}

function transformSelection(
  context: ProcessedTargetsContext,
  transformation: Transformation,
  selection: SelectionWithUri
): SelectionWithUri {
  switch (transformation.type) {
    case "identity":
      return selection;
    case "containingSymbolDefinition":
    case "matchingPairSymbol":
    case "subpiece":
    case "surroundingPair":
      throw new Error("Not implemented");
  }
}

function createTypedSelection(
  context: ProcessedTargetsContext,
  selectionType: SelectionType,
  selection: SelectionWithUri
): TypedSelection {
  switch (selectionType) {
    case "token":
      return { selection, selectionType };

    case "line":
      const originalSelectionStart = selection.selection.start;
      const originalSelectionEnd = selection.selection.end;

      const start = new vscode.Position(originalSelectionStart.line, 0);
      const end =
        originalSelectionEnd.line > originalSelectionStart.line &&
        originalSelectionEnd.character === 0
          ? originalSelectionEnd
          : new vscode.Position(originalSelectionEnd.line + 1, 0);

      const isAnchorBeforeActive = selection.selection.anchor.isBeforeOrEqual(
        selection.selection.active
      );
      const anchor = isAnchorBeforeActive ? start : end;
      const active = isAnchorBeforeActive ? end : start;

      return {
        selection: {
          selection: new Selection(anchor, active),
          documentUri: selection.documentUri,
        },
        selectionType,
      };

    case "block":
    case "character":
      throw new Error("Not implemented");
  }
}

function performPositionAdjustment(
  context: ProcessedTargetsContext,
  position: Position,
  selection: TypedSelection
): TypedSelection {
  var newSelection;
  const originalSelection = selection.selection.selection;

  switch (position) {
    case "contents":
      newSelection = originalSelection;
      break;
    case "before":
      newSelection = new Selection(
        originalSelection.start,
        originalSelection.start
      );
      break;
    case "after":
      newSelection = new Selection(
        originalSelection.end,
        originalSelection.end
      );
      break;
    case "start":
    case "end":
      throw new Error("Not implemented");
  }

  return {
    selection: {
      selection: newSelection,
      documentUri: selection.selection.documentUri,
    },
    selectionType: selection.selectionType,
  };
}
