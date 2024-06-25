import * as sbd from "sbd";
import { MatchedText, matchRegex, testRegex } from "../../../../util/regex";

// A sentence starts with a letter with adjacent leading symbols. Whitespace excluded.
const leadingOffsetRegex = /\S*\p{L}/u;
/**
 * This regex is used to split the text that comes back from sbd. Anything
 * matching this regex will be discarded from the returned sentence, and split
 * the sentence in two if it occurs in the middle of a sentence. The regex
 * matches either of the following:
 * 1. An entire line containing no letters.
 * 2. If a line ends in `[.!?]`, possibly followed by whitespace, we split on
 *    that. This is a workaround for #1753. FIXME: Remove this second term once
 *    #1753 is fixed.
 */
const skipPartRegex = /(\r?\n[^\p{L}]*\r?\n)|(?<=[.!?])(\s*\r?\n)/gu;

const options: sbd.Options = {
  ["newline_boundaries"]: false,
  ["preserve_whitespace"]: true,
};

export class SentenceSegmenter {
  *segment(text: string): Iterable<MatchedText> {
    const sentences = sbd.sentences(text, options);
    let index = 0;

    for (const sentence of sentences) {
      const parts = sentence.split(skipPartRegex).filter((p) => p != null);

      for (const part of parts) {
        if (!skipPart(part)) {
          const segment = createSegment(part, index);
          if (segment != null) {
            yield segment;
          }
        }

        index += part.length;
      }
    }
  }
}

function createSegment(
  sentence: string,
  index: number,
): MatchedText | undefined {
  const leadingOffsetMatch = matchRegex(leadingOffsetRegex, sentence);

  if (leadingOffsetMatch == null) {
    return undefined;
  }

  const leadingOffset = leadingOffsetMatch.index!;

  if (leadingOffset !== 0) {
    index += leadingOffset;
    sentence = sentence.slice(leadingOffset);
  }

  return {
    text: sentence.trimEnd(),
    index,
  };
}

function skipPart(text: string): boolean {
  return testRegex(skipPartRegex, text);
}
