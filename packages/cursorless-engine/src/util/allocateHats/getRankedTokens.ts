import {
  CompositeKeyMap,
  TextEditor,
  Token,
  TokenHat,
} from "@cursorless/common";
import { flatten } from "lodash-es";
import { getDisplayLineMap } from "./getDisplayLineMap";
import { getTokenComparator } from "./getTokenComparator";
import { getTokensInRange } from "./getTokensInRange";

/**
 * Constructs a list of all tokens that are visible in the given editors ordered
 * by their rank along with their ranks
 * @returns A list of tokens along with their ranks, sorted by decreasing rank
 */
export function getRankedTokens(
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
  forcedHatMap: CompositeKeyMap<Token, TokenHat> | undefined,
): RankedToken[] {
  const editors: readonly TextEditor[] = getRankedEditors(
    activeTextEditor,
    visibleTextEditors,
  );

  const tokens = editors.flatMap((editor) => {
    /**
     * The reference position that will be used to judge how likely a given
     * token is to be used.  Tokens closer to this position will be considered
     * more likely to be used, and will get better hats.  We use the first
     * selection's {@link Selection.active active}.
     */
    const referencePosition = editor.selections[0].active;
    const displayLineMap = getDisplayLineMap(editor, [referencePosition.line]);
    const tokens = flatten(
      editor.visibleRanges.map((range) =>
        getTokensInRange(editor, range).map((partialToken) => ({
          ...partialToken,
          displayLine: displayLineMap.get(partialToken.range.start.line)!,
        })),
      ),
    );

    tokens.sort(
      getTokenComparator(
        displayLineMap.get(referencePosition.line)!,
        referencePosition.character,
      ),
    );

    return tokens;
  });

  return moveForcedHatsToFront(forcedHatMap, tokens).map((token, index) => ({
    token,
    rank: -index,
  }));
}

function moveForcedHatsToFront(
  forcedHatMap: CompositeKeyMap<Token, TokenHat> | undefined,
  tokens: Token[],
) {
  if (forcedHatMap == null) {
    return tokens;
  }

  return tokens.sort((a, b) => {
    const aIsForced = forcedHatMap.has(a);
    const bIsForced = forcedHatMap.has(b);
    if (aIsForced && !bIsForced) {
      return -1;
    }
    if (!aIsForced && bIsForced) {
      return 1;
    }
    return 0;
  });
}

function getRankedEditors(
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
) {
  let editors: readonly TextEditor[];

  if (activeTextEditor == null) {
    editors = visibleTextEditors;
  } else {
    editors = [
      activeTextEditor!,
      ...visibleTextEditors.filter((editor) => editor !== activeTextEditor),
    ];
  }
  return editors;
}

export interface RankedToken {
  token: Token;

  /**
   * A number indicating how likely the token is to be used.  Tokens closer to
   * the cursor will be considered more likely to be used, and will receive a
   * higher rank, causing them to be assigned better hats.
   */
  rank: number;
}
