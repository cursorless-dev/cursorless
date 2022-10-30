import { Position, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { DocumentTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import { TargetScope } from "./scope.types";

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
    const contentRange = getDocumentRange(editor.document);

    yield {
      editor,
      domain: contentRange,
      getTarget: (isReversed) =>
        new DocumentTarget({
          editor,
          isReversed,
          contentRange,
        }),
    };
  }
}
