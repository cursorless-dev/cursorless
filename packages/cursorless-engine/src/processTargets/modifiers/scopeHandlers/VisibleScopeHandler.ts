import { TextEditor, Position } from "@cursorless/common";
import { Direction, ScopeType } from "@cursorless/common";
import { PlainTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import { TargetScope } from "./scope.types";

export default class VisibleScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "visible" } as const;
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
    yield {
      editor,
      domain: editor.document.range,
      getTargets: (isReversed) =>
        editor.visibleRanges.map(
          (range) =>
            new PlainTarget({
              editor,
              isReversed,
              contentRange: range,
            }),
        ),
    };
  }
}
