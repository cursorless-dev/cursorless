import type { TextEditor, Position } from "@cursorless/common";
import type { Direction, ScopeType } from "@cursorless/common";
import { DocumentTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import type { TargetScope } from "./scope.types";

export default class DocumentScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "document" } as const;
  public readonly iterationScopeType = { type: "document" } as const;
  protected readonly isHierarchical = false;

  constructor(_scopeType: ScopeType, _languageId: string) {
    super();
  }

  protected *generateScopeCandidates(
    editor: TextEditor,
    _position: Position,
    _direction: Direction,
  ): Iterable<TargetScope> {
    const contentRange = editor.document.range;

    yield {
      editor,
      domain: contentRange,
      getTargets: (isReversed) => [
        new DocumentTarget({
          editor,
          isReversed,
          contentRange,
        }),
      ],
    };
  }
}
