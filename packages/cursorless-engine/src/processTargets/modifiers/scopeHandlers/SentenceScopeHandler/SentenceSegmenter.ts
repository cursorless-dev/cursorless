import { getTrailingWhitespace } from "../../../../util/regex";

const delimiters = [".", "?", "!"];
const abbreviations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Vs."];

const abbreviationsSet = new Set(abbreviations);
// Don't match delimiters followed by non-whitespace. eg: example.com
const delimitersPattern = `[${delimiters.join("")}](?!\\S)`;
const abbreviationsPattern = abbreviations
  .map((a) => a.replace(".", "\\."))
  .join("|");
const invalidLinePattern = "\\n\\W*\\n";
const pattern = `${delimitersPattern}|${abbreviationsPattern}|${invalidLinePattern}`;
const regex = new RegExp(pattern, "g");
const leadingOffsetPattern = /[a-zA-Z]/;

export default class SentenceSegmenter {
  *segment(text: string): Iterable<Intl.SegmentData> {
    let index = 0;

    const createsSegment = (
      delimiter: string,
      endIndex: number,
    ): Intl.SegmentData | undefined => {
      let segment = text.slice(index, endIndex);
      const leadingOffset =
        segment.match(leadingOffsetPattern)?.index ?? segment.length;
      const trailingWhitespace = getTrailingWhitespace(segment);

      if (leadingOffset !== 0 || trailingWhitespace !== "") {
        if (segment.length === leadingOffset) {
          return undefined;
        }
        index += leadingOffset;
        endIndex -= trailingWhitespace.length;
        segment = text.slice(index, endIndex);
      }

      const result = {
        input: text,
        segment,
        index,
      };

      index = endIndex;

      return result;
    };

    for (const m of matchAll(text, regex)) {
      const matchText = m[0];
      if (isAbbreviation(matchText)) {
        continue;
      }
      const segment = isInvalidLine(matchText)
        ? createsSegment(matchText, m.index!)
        : createsSegment(matchText, m.index! + matchText.length);
      if (segment != null) {
        yield segment;
      }
    }

    if (index < text.length) {
      const segment = createsSegment("", text.length);
      if (segment != null) {
        yield segment;
      }
    }
  }
}

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
