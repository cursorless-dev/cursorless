import { concat, zip } from "lodash";
import { SyntaxNode } from "tree-sitter";
import * as vscode from "vscode";
import { Selection } from "vscode";
import nodeMatchers from "./nodeMatchers";
import {
  Mark,
  Position,
  PrimitiveTarget,
  ProcessedTargetsContext,
  RangeTarget,
  SelectionContext,
  SelectionType,
  SelectionWithEditor,
  Target,
  Transformation,
  TypedSelection,
} from "./Types";

export default function processTargets(
  context: ProcessedTargetsContext,
  targets: Target[]
): TypedSelection[][] {
  return targets.map((target) => processSingleTarget(context, target));
}

function processSingleTarget(
  context: ProcessedTargetsContext,
  target: Target
): TypedSelection[] {
  switch (target.type) {
    case "list":
      return concat(
        [],
        ...target.elements.map((target) => processSingleTarget(context, target))
      );
    case "range":
      return processSingleRangeTarget(context, target);
    case "primitive":
      return processSinglePrimitiveTarget(context, target);
  }
}

function processSingleRangeTarget(
  context: ProcessedTargetsContext,
  target: RangeTarget
): TypedSelection[] {
  const startTargets = processSinglePrimitiveTarget(context, target.start);
  const endTargets = processSinglePrimitiveTarget(context, target.end);

  if (startTargets.length !== endTargets.length) {
    throw new Error("startTargets and endTargets lengths don't match");
  }

  return zip(startTargets, endTargets).map(([startTarget, endTarget]) => {
    if (startTarget!.selection.editor !== endTarget!.selection.editor) {
      throw new Error("startTarget and endTarget must be in same document");
    }

    const startSelection = startTarget!.selection.selection;
    const endSelection = endTarget!.selection.selection;

    const isStartBeforeEnd = startSelection.start.isBeforeOrEqual(
      endSelection.end
    );

    const anchor = isStartBeforeEnd ? startSelection.start : startSelection.end;
    const active = isStartBeforeEnd ? endSelection.end : endSelection.start;

    return {
      selection: {
        selection: new Selection(anchor, active),
        editor: startTarget!.selection.editor,
      },
      selectionType: startTarget!.selectionType,
      selectionContext: startTarget!.selectionContext,
    };
  });
}

function processSinglePrimitiveTarget(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget
): TypedSelection[] {
  const markSelections = getSelectionsFromMark(context, target.mark);
  const transformedSelections = markSelections.map((markSelection) =>
    transformSelection(context, target, markSelection)
  );
  const typedSelections = transformedSelections.map(
    ({ selection, context: selectionContext }) =>
      createTypedSelection(context, target, selection, selectionContext)
  );
  return typedSelections.map((selection) =>
    performPositionAdjustment(context, target.position, selection)
  );
}

function getSelectionsFromMark(
  context: ProcessedTargetsContext,
  mark: Mark
): SelectionWithEditor[] {
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
          editor: token.editor,
        },
      ];
    case "lastCursorPosition":
    case "lastEditRange":
      throw new Error("Not implemented");
  }
}

function transformSelection(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor
): { selection: SelectionWithEditor; context: SelectionContext } {
  const { transformation, isInside } = target;

  switch (transformation.type) {
    case "identity":
      return { selection, context: {} };
    case "containingScope":
      var node: SyntaxNode | null = context.getNodeAtLocation(
        new vscode.Location(selection.editor.document.uri, selection.selection)
      );

      const nodeMatcher = nodeMatchers[transformation.scopeType];

      while (node != null) {
        const matchedSelection = nodeMatcher(selection.editor, node, isInside);
        if (matchedSelection != null) {
          return {
            selection: {
              editor: selection.editor,
              selection: matchedSelection.selection,
            },
            context: matchedSelection.context,
          };
        }
        console.log(node.type);
        node = node.parent;
      }

      throw new Error(`Couldn't find containing ${transformation.scopeType}`);
    case "matchingPairSymbol":
    case "subpiece":
    case "surroundingPair":
      throw new Error("Not implemented");
  }
}

function createTypedSelection(
  context: ProcessedTargetsContext,
  target: PrimitiveTarget,
  selection: SelectionWithEditor,
  selectionContext: SelectionContext
): TypedSelection {
  const { selectionType, isInside } = target;

  switch (selectionType) {
    case "token":
      return { selection, selectionType, selectionContext };

    case "line":
      const originalSelectionStart = selection.selection.start;
      const originalSelectionEnd = selection.selection.end;

      var start: vscode.Position;
      var end: vscode.Position;

      if (isInside) {
        const startLine = selection.editor.document.lineAt(
          originalSelectionStart.line
        );
        const endLine = selection.editor.document.lineAt(
          originalSelectionEnd.line
        );
        start = new vscode.Position(
          originalSelectionStart.line,
          startLine.firstNonWhitespaceCharacterIndex
        );
        end = endLine.range.end;
      } else {
        start = new vscode.Position(originalSelectionStart.line, 0);
        end =
          originalSelectionEnd.line > originalSelectionStart.line &&
          originalSelectionEnd.character === 0
            ? originalSelectionEnd
            : new vscode.Position(originalSelectionEnd.line + 1, 0);
      }

      const isAnchorBeforeActive = selection.selection.anchor.isBeforeOrEqual(
        selection.selection.active
      );
      const anchor = isAnchorBeforeActive ? start : end;
      const active = isAnchorBeforeActive ? end : start;

      return {
        selection: {
          selection: new Selection(anchor, active),
          editor: selection.editor,
        },
        selectionType,
        selectionContext,
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
  }

  return {
    selection: {
      selection: newSelection,
      editor: selection.selection.editor,
    },
    selectionType: selection.selectionType,
    selectionContext: selection.selectionContext,
  };
}
