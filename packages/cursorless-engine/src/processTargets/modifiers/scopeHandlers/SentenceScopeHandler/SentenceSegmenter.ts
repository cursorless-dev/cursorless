import * as sbd from "sbd";
import { MatchedText, matchRegex, testRegex } from "../../../../util/regex";

// A sentence starts with a letter with adjacent leading symbols. Whitespace excluded.
const leadingOffsetRegex = /\S*\p{L}/u;
// A line with no letters is invalid and breaks sentences
// Also break lines ending with [.!?]
const skipPartRegex = /(\r?\n[^\p{L}]*\r?\n)|(?<=[.!?])(\s*\r?\n)/gu;

const options: sbd.Options = {
  ["newline_boundaries"]: false,
  ["preserve_whitespace"]: true,
};

export default class SentenceSegmenter {
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
