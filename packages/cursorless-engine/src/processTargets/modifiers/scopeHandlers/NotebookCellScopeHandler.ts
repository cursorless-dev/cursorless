import type {
  Direction,
  Position,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { NotebookCellTarget } from "../../targets";
import { TargetScope } from "./scope.types";
import BaseScopeHandler from "./BaseScopeHandler";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

export default class NotebookCellScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "notebookCell" } as const;
  protected isHierarchical = false;

  constructor(_scopeType: ScopeType, _languageId: string) {
    super();
  }

  get iterationScopeType(): ScopeType {
    throw new Error(`Every ${this.scopeType.type} not yet implemented`);
  }

  protected *generateScopeCandidates(
    editor: TextEditor,
    _position: Position,
    _direction: Direction,
    _hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    const contentRange = editor.document.range;

    yield {
      editor,
      domain: contentRange,
      getTargets: (isReversed) => [
        new NotebookCellTarget({
          editor,
          isReversed,
          contentRange: contentRange,
        }),
      ],
    };
  }
}
