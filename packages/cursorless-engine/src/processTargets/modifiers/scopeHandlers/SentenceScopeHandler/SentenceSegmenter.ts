import { getTrailingWhitespace } from "../../../../util/regex";
import { abbreviations, delimiters } from "./Language";

const abbreviationsSet = new Set(abbreviations);
// Don't match delimiters followed by non-whitespace. eg: example.com
const delimitersPattern = `[${delimiters.join("")}](?!\\S)`;
const abbreviationsPattern = abbreviations
  .map((a) => a.replace(".", "\\."))
  .join("|");
// A line with no letters is invalid
const invalidLinePattern = "\\n[^\\p{L}]*\\n";
const pattern = `${delimitersPattern}|${abbreviationsPattern}|${invalidLinePattern}`;
const regex = new RegExp(pattern, "gu");
// A sentence starts with a letter
const leadingOffsetRegex = /\p{L}/u;

export default class SentenceSegmenter {
  *segment(text: string): Iterable<Intl.SegmentData> {
    let index = 0;

    for (const m of matchAll(text, regex)) {
      const matchText = m[0];

      if (isAbbreviation(matchText)) {
        continue;
      }

      const segment = isInvalidLine(matchText)
        ? createsSegment(text, index, m.index!)
        : createsSegment(text, index, m.index! + matchText.length);

      if (segment != null) {
        yield segment;
      }

      index = m.index! + matchText.length;
    }

    if (index < text.length) {
      const segment = createsSegment(text, index, text.length);

      if (segment != null) {
        yield segment;
      }
    }
  }
}

const createsSegment = (
  text: string,
  startIndex: number,
  endIndex: number,
): Intl.SegmentData | undefined => {
  let segment = text.slice(startIndex, endIndex);
  const leadingOffset =
    segment.match(leadingOffsetRegex)?.index ?? segment.length;

  if (segment.length === leadingOffset) {
    return undefined;
  }

  const trailingWhitespace = getTrailingWhitespace(segment);

  if (leadingOffset !== 0 || trailingWhitespace !== "") {
    startIndex += leadingOffset;
    segment = text.slice(startIndex, endIndex - trailingWhitespace.length);
  }

  return {
    input: text,
    index: startIndex,
    segment,
  };
};

function isInvalidLine(text: string): boolean {
  return text[0] === "\n";
}

function isAbbreviation(text: string): boolean {
  return abbreviationsSet.has(text);
}

function matchAll(text: string, regex: RegExp) {
  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;
  return text.matchAll(regex);
}
