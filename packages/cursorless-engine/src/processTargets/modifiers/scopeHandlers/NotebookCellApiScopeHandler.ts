import {
  Range,
  type Direction,
  type NotebookCell,
  type Position,
  type TextEditor,
} from "@cursorless/common";
import { ide } from "../../../singletons/ide.singleton";
import { NotebookCellTarget } from "../../targets";
import { BaseScopeHandler } from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";
import type { ScopeIteratorRequirements } from "./scopeHandler.types";

/**
 * This is the scope handler for the actual notebook API in the IDE.
 */
export class NotebookCellApiScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "notebookCell" } as const;
  public readonly iterationScopeType = { type: "document" } as const;
  protected isHierarchical = false;

  constructor() {
    super();
  }

  *generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const cells = getNotebookCells(editor, position, direction, hints);

    for (const cell of cells) {
      yield createTargetScope(cell);
    }
  }
}

function getNotebookCells(
  editor: TextEditor,
  position: Position,
  direction: Direction,
  hints: ScopeIteratorRequirements,
) {
  const nb = getNotebook(editor);

  if (nb == null) {
    return [];
  }

  const { notebook, cell } = nb;

  if (hints.containment === "required") {
    return [cell];
  }

  if (
    hints.containment === "disallowed" ||
    hints.containment === "disallowedIfStrict"
  ) {
    return direction === "forward"
      ? notebook.cells.slice(cell.index + 1)
      : notebook.cells.slice(0, cell.index).reverse();
  }

  // Every scope
  if (hints.distalPosition != null) {
    const searchRange = new Range(position, hints.distalPosition);
    if (searchRange.isRangeEqual(editor.document.range)) {
      return notebook.cells;
    }
  }

  return direction === "forward"
    ? notebook.cells.slice(cell.index)
    : notebook.cells.slice(0, cell.index + 1).reverse();
}

function getNotebook(editor: TextEditor) {
  const uri = editor.document.uri.toString();
  for (const notebook of ide().visibleNotebookEditors) {
    for (const cell of notebook.cells) {
      if (cell.document.uri.toString() === uri) {
        return { notebook, cell };
      }
    }
  }
  return undefined;
}

function createTargetScope(cell: NotebookCell): TargetScope {
  const editor = getEditor(cell);
  const contentRange = editor.document.range;
  return {
    editor,
    domain: contentRange,
    getTargets: (isReversed: boolean) => [
      new NotebookCellTarget({
        editor,
        isReversed,
        contentRange,
      }),
    ],
  };
}

function getEditor(cell: NotebookCell) {
  const uri = cell.document.uri.toString();
  for (const editor of ide().visibleTextEditors) {
    if (editor.document.uri.toString() === uri) {
      return editor;
    }
  }
  throw new Error("Editor not found notebook cell");
}
