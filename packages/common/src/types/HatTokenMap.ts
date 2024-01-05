import { SerializedMarks, TextEditor, plainObjectToRange, splitKey } from "..";
import { HatStyleName } from "../ide/types/hatStyles.types";
import { Range } from "./Range";
import { Token } from "./Token";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export interface HatTokenMap {
  allocateHats(oldTokenHats?: TokenHat[]): Promise<void>;
  getReadableMap(usePrePhraseSnapshot: boolean): Promise<ReadOnlyHatMap>;
}

export interface TokenHat {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export interface ReadOnlyHatMap {
  getEntries(): readonly [string, Token][];
  getToken(hatStyle: HatStyleName, character: string): Token;
}

export function getTokenHats(
  marks: SerializedMarks | undefined,
  editor: TextEditor,
): TokenHat[] {
  if (marks == null) {
    return [];
  }

  return Object.entries(marks).map(([key, token]) => {
    const { hatStyle, character } = splitKey(key);
    const range = plainObjectToRange(token);

    return {
      hatStyle,
      grapheme: character,
      token: {
        editor,
        range,
        offsets: {
          start: editor.document.offsetAt(range.start),
          end: editor.document.offsetAt(range.end),
        },
        text: editor.document.getText(range),
      },

      // NB: We don't care about the hat range for this test
      hatRange: range,
    };
  });
}
