import { plainObjectToRange } from "../testUtil/fromPlainObject";
import { splitKey } from "./splitKey";
import type { SerializedMarks } from "./toPlainObject";
import type { TextEditor } from "../types/TextEditor";
import type { TokenHat } from "../types/HatTokenMap";

export function serializedMarksToTokenHats(
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
