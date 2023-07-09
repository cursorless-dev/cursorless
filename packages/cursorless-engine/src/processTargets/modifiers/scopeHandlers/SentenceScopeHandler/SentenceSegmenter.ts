import * as sbd from "sbd";
import { MatchedText, matchRegex, testRegex } from "../../../../util/regex";

// A sentence starts with a letter
const leadingOffsetRegex = /\p{L}/u;
// A line with no letters is invalid and breaks sentences
const invalidLineRegex = /(\n[^\p{L}]*\n)/gu;

const options: sbd.Options = {
  ["newline_boundaries"]: false,
  ["preserve_whitespace"]: true,
};

export default class SentenceSegmenter {
  *segment(text: string): Iterable<MatchedText> {
    const sentences = sbd.sentences(text, options);
    let index = 0;

    for (const sentence of sentences) {
      const parts = sentence.split(invalidLineRegex);

      for (const part of parts) {
        if (!isInvalidLine(part)) {
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
  const leadingOffset =
    matchRegex(leadingOffsetRegex, sentence)?.index ?? sentence.length;

  if (sentence.length === leadingOffset) {
    return undefined;
  }

  if (leadingOffset !== 0) {
    index += leadingOffset;
    sentence = sentence.slice(leadingOffset);
  }

  return {
    text: sentence.trimEnd(),
    index,
  };
}

function isInvalidLine(text: string): boolean {
  return testRegex(invalidLineRegex, text);
}
