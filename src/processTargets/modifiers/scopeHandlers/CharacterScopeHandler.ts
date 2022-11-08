import { TextEditor, Position, Range } from "vscode";
import { Direction } from "../../../typings/targetDescriptor.types";
import { getDocumentRange, makeEmptyRange } from "../../../util/rangeUtils";
import { getMatchesInRange } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import { OutOfRangeError } from "../targetSequenceUtils";
import { expandRange } from "./expandRange";
import NestedScopeHandler from "./NestedScopeHandler";
import { TargetScope } from "./scope.types";

const EXPANSION_CHARACTERS = 4;
export const SPLIT_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;

export default class CharacterScopeHandler extends NestedScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;
  protected get searchScopeType() {
    return {
      type: "fixedExpansion",
      numCharacters: EXPANSION_CHARACTERS,
    } as const;
  }

  protected getScopesInSearchScope(searchScope: TargetScope): TargetScope[] {
    const { editor, domain } = searchScope;

    return getScopesInRange(editor, domain);
  }

  getScopeRelativeToPosition(
    editor: TextEditor,
    position: Position,
    offset: number,
    direction: Direction,
  ): TargetScope {
    const { document } = editor;
    let forwardExpansion = offset + EXPANSION_CHARACTERS;
    const emptyRange = makeEmptyRange(position);

    while (true) {
      const range = expandRange(
        EXPANSION_CHARACTERS,
        forwardExpansion,
        document,
        emptyRange,
      );

      const scopes = getScopesInRange(editor, range).filter(({ domain }) =>
        direction === "forward"
          ? domain.start.isAfterOrEqual(position)
          : domain.end.isBeforeOrEqual(position),
      );

      if (scopes.length >= offset) {
        return direction === "forward"
          ? scopes.at(offset - 1)!
          : scopes.at(-offset)!;
      }

      if (
        (direction === "forward" &&
          range.end.isEqual(getDocumentRange(document).end)) ||
        (direction === "backward" &&
          range.start.isEqual(getDocumentRange(document).start))
      ) {
        throw new OutOfRangeError();
      }

      forwardExpansion = forwardExpansion * 2;
    }
  }
}

function getScopesInRange(editor: TextEditor, range: Range): TargetScope[] {
  return getMatchesInRange(SPLIT_REGEX, editor, range).map((r) => ({
    editor,
    domain: r,
    getTarget: (isReversed) =>
      new PlainTarget({
        editor,
        contentRange: r,
        isReversed,
      }),
  }));
}
