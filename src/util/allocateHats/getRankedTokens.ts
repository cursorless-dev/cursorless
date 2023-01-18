import { TextEditor } from "@cursorless/common";
import { flatten } from "lodash";
import { getMatcher } from "../../libs/cursorless-engine/tokenizer";
import { Token } from "../../typings/Types";
import { getDisplayLineMap } from "../getDisplayLineMap";
import { getTokenComparator } from "../getTokenComparator";
import { getTokensInRange } from "../getTokensInRange";

/**
 * Constructs a list of all tokens that are visible in the given editors ordered
 * by their rank along with their ranks
 * @param editors The editors from which to generate tokens for their visible
 * ranges
 * @returns A list of tokens along with their ranks sorted by a increasing rank
 */
export function getRankedTokens(
  activeTextEditor: TextEditor | undefined,
  visibleTextEditors: readonly TextEditor[],
): RankedToken[] {
  const editors: readonly TextEditor[] = getRankedEditors(
    activeTextEditor,
    visibleTextEditors,
  );
  return editors.flatMap((editor) => {
    /**
     * The reference position that will be used to judge how likely a given
     * token is to be used.  Tokens closer to this position will be considered
     * more likely to be used, and will get better hats.  We use the first
     * selection's {@link Selection.active active}.
     */
    const referencePosition = editor.selections[0].active;
    const displayLineMap = getDisplayLineMap(editor, [referencePosition.line]);
    const languageId = editor.document.languageId;
    const tokens: Token[] = flatten(
      editor.visibleRanges.map((range) =>
        getTokensInRange(editor, range).map((partialToken) => ({
          ...partialToken,
          displayLine: displayLineMap.get(partialToken.range.start.line)!,
          editor,
          expansionBehavior: {
            start: {
              type: "regex",
              regex: getMatcher(languageId).tokenMatcher,
            },
            end: {
              type: "regex",
              regex: getMatcher(languageId).tokenMatcher,
            },
          },
        })),
      ),
    );

    tokens.sort(
      getTokenComparator(
        displayLineMap.get(referencePosition.line)!,
        referencePosition.character,
      ),
    );

    return tokens.map((token, index) => ({ token, rank: index }));
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
   * lower rank, causing them to be assigned better hats.
   */
  rank: number;
}
