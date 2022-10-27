import { Position, TextEditor } from "vscode";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { DocumentTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import { TargetScope } from "./scope.types";
import { ScopeHandler } from "./scopeHandler.types";

export default class DocumentScopeHandler implements ScopeHandler {
  public readonly scopeType = { type: "document" } as const;
  public readonly iterationScopeType = { type: "document" } as const;

  constructor(_scopeType: ScopeType, _languageId: string) {
    // Empty
  }

  getPreferredScopeTouchingPosition(
    editor: TextEditor,
    _position: Position,
  ): TargetScope | undefined {
    return getDocumentScope(editor);
  }

  *generateScopesRelativeToPosition(
    editor: TextEditor,
    position: Position,
    direction: Direction,
  ): Iterable<TargetScope> {
    const document = getDocumentRange(editor.document);

    if (
      (direction === "forward" && position.isEqual(document.end)) ||
      (direction === "backward" && position.isEqual(document.start))
    ) {
      return;
    }

    yield getDocumentScope(editor);
  }
}

function getDocumentScope(editor: TextEditor): TargetScope {
  const contentRange = getDocumentRange(editor.document);

  return {
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
