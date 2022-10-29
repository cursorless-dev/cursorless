import { flatmap, imap } from "itertools";
import { Position, Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { Direction } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { generateMatchesInRange, testRegex } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import { expandPosition, expandRange } from "./expandRange";
import type { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

const EXPANSION_CHARACTERS = 4;
const INITIAL_SEARCH_RANGE_LENGTH = 16;
const SPLIT_REGEX = /\p{L}\p{M}*|\r?\n|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;
const NONWHITESPACE_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;
const WHITESPACE_REGEX = /\p{Z}/gu;

export default class CharacterScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;
  protected readonly isHierarchical = false;

  private generateScopesInRange(
    editor: TextEditor,
    range: Range,
    direction: Direction,
  ): Iterable<TargetScope> {
    return imap(
      generateMatchesInRange(SPLIT_REGEX, editor, range, direction),
      (range) => ({
        editor,
        domain: range,
        getTarget: (isReversed) =>
          new PlainTarget({
            editor,
            contentRange: range,
            isReversed,
          }),
      }),
    );
  }

  protected generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    return flatmap(
      this.generateSearchRanges(editor, position, direction, hints),
      (range) => this.generateScopesInRange(editor, range, direction),
    );
  }

  private *generateSearchRanges(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<Range> {
    const { document } = editor;
    const { distalPosition } = hints;

    if (distalPosition != null) {
      yield expandRange(
        EXPANSION_CHARACTERS,
        EXPANSION_CHARACTERS,
        document,
        new Range(position, distalPosition),
      );

      return;
    }

    let coreSearchRange = INITIAL_SEARCH_RANGE_LENGTH;
    let currentPosition = position;

    while (true) {
      const [numCharactersBackward, numCharactersForward] =
        direction === "forward" ? [0, coreSearchRange] : [coreSearchRange, 0];

      const range = expandPosition(
        numCharactersBackward + EXPANSION_CHARACTERS,
        numCharactersForward + EXPANSION_CHARACTERS,
        document,
        currentPosition,
      );

      yield range;

      if (
        (direction === "forward" &&
          range.end.isEqual(getDocumentRange(document).end)) ||
        (direction === "backward" &&
          range.start.isEqual(getDocumentRange(document).start))
      ) {
        return;
      }

      coreSearchRange = coreSearchRange * 2;
      currentPosition = direction === "forward" ? range.end : range.start;
    }
  }

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined {
    const {
      editor: { document },
    } = scopeA;
    const { identifierMatcher } = getMatcher(document.languageId);

    const aText = document.getText(scopeA.domain);
    const bText = document.getText(scopeB.domain);

    const matchers = [identifierMatcher, NONWHITESPACE_REGEX, WHITESPACE_REGEX];

    for (const matcher of matchers) {
      // NB: Don't directly use `test` here because global regexes are stateful
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
      if (testRegex(matcher, aText) && !testRegex(matcher, bText)) {
        return true;
      }

      if (testRegex(matcher, bText) && !testRegex(matcher, aText)) {
        return false;
      }
    }

    return undefined;
  }
}
