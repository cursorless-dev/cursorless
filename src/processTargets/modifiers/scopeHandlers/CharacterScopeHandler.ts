import { filter, flatmap, imap } from "itertools";
import { Position, Range, TextEditor } from "vscode";
import { getMatcher } from "../../../core/tokenizer";
import { Direction, ScopeType } from "../../../typings/targetDescriptor.types";
import { getDocumentRange } from "../../../util/rangeUtils";
import { generateMatchesInRange, testRegex } from "../../../util/regex";
import { PlainTarget } from "../../targets";
import BaseScopeHandler from "./BaseScopeHandler";
import { expandPosition, expandRange } from "./expandRange";
import type { TargetScope } from "./scope.types";
import { ScopeIteratorRequirements } from "./scopeHandler.types";

const EXPANSION_CHARACTERS = 4;
const INITIAL_SEARCH_RANGE_LENGTH = 16;

/**
 * The regex used to split a range into characters.  Combines letters with their
 * diacritics, and combines `\r\n` into one character.  Otherwise just looks for
 * simple characters.
 */
const SPLIT_REGEX = /\p{L}\p{M}*|\r?\n|[\p{N}\p{P}\p{S}\p{Z}\p{C}]/gu;

const NONWHITESPACE_REGEX = /\p{L}\p{M}*|[\p{N}\p{P}\p{S}]/gu;

/**
 * Matches whitespace, but not newlines
 */
const WHITESPACE_REGEX = /\p{Z}/gu;

export default class CharacterScopeHandler extends BaseScopeHandler {
  public readonly scopeType = { type: "character" } as const;
  public readonly iterationScopeType = { type: "token" } as const;
  protected readonly isHierarchical = false;

  constructor(_scopeType: ScopeType, private languageId: string) {
    super();
  }

  private generateScopesInRange(
    editor: TextEditor,
    range: Range,
    direction: Direction,
  ): Iterable<TargetScope> {
    return imap(
      filter(
        generateMatchesInRange(SPLIT_REGEX, editor, range, direction),

        // Ignore anything that ends at the end of the range because it could
        // have trailing diacritics
        (r) => !r.end.isEqual(range.end),
      ),
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

  /**
   * Returns an iterator of ranges in which to search for scopes.
   *
   * If there is a
   * {@link ScopeIteratorRequirements.distalPosition|distalPosition}, just
   * yields a single range: from {@link position} to
   * {@link ScopeIteratorRequirements.distalPosition}, expanded by
   * {@link EXPANSION_CHARACTERS} on either side in case the range ends in the
   * middle or a scope.
   *
   * If there is no
   * {@link ScopeIteratorRequirements.distalPosition|distalPosition}, starts by
   * yielding a range of length {@link INITIAL_SEARCH_RANGE_LENGTH}, expanded by
   * {@link EXPANSION_CHARACTERS} on either side, then moves the search range to
   * the end (or start, if {@link direction} is `"backward"`) of the previous
   * search range and doubles the width, expanded on either side by
   * {@link EXPANSION_CHARACTERS}.  Note that
   *
   * @param editor
   * @param position
   * @param direction
   * @param hints
   */
  private *generateSearchRanges(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints: ScopeIteratorRequirements,
  ): Iterable<Range> {
    const { document } = editor;
    const { distalPosition } = hints;

    if (distalPosition != null) {
      // If we have a distalPosition, just expand it by EXPANSION_CHARACTERS and
      // yield it
      yield expandRange(
        EXPANSION_CHARACTERS,
        EXPANSION_CHARACTERS,
        document,
        new Range(position, distalPosition),
      );

      return;
    }

    // If we have no distalPosition, we progressively move forward (or backward)
    // and double the width of the range.

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

      // Move the range
      currentPosition = direction === "forward" ? range.end : range.start;

      // Double the width
      coreSearchRange = coreSearchRange * 2;
    }
  }

  isPreferredOver(
    scopeA: TargetScope,
    scopeB: TargetScope,
  ): boolean | undefined {
    const {
      editor: { document },
    } = scopeA;
    const { identifierMatcher } = getMatcher(this.languageId);

    const aText = document.getText(scopeA.domain);
    const bText = document.getText(scopeB.domain);

    // Regexes indicating preferences.  We prefer identifiers, then
    // nonwhitespace, then whitespace but not newline.  We only pick newlines as
    // a last resort.
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
