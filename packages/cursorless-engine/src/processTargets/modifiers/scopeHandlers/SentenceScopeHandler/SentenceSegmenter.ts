import {
  getLeadingWhitespace,
  getTrailingWhitespace,
} from "../../../../util/regex";

const delimiters = [".", "?", "!"];
const abbreviations = ["Mr.", "Mrs.", "Ms.", "Dr.", "Vs.", "St."];

// Don't match delimiters followed by non-whitespace. eg: example.com
const delimitersPattern = `[${delimiters.join("")}](?!\\S)`;
const abbreviationsPattern = abbreviations.join("|");
const pattern = `${delimitersPattern}|${abbreviationsPattern}`;
const regex = new RegExp(pattern, "g");

export default class SentenceSegmenter {
  *segment(text: string): Iterable<Intl.SegmentData> {
    let index = 0;

    const createsSegment = (
      delimiter: string,
      endIndex: number,
    ): Intl.SegmentData | undefined => {
      let segment = text.slice(index, endIndex);
      const leadingWhitespace = getLeadingWhitespace(segment);
      const trailingWhitespace = getTrailingWhitespace(segment);

      if (leadingWhitespace !== "" || trailingWhitespace !== "") {
        if (segment.length === leadingWhitespace.length) {
          return undefined;
        }
        index += leadingWhitespace.length;
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
      if (abbreviations.includes(matchText)) {
        continue;
      }
      yield createsSegment(matchText, m.index! + matchText.length)!;
    }

    if (index < text.length) {
      const segment = createsSegment("", text.length);
      if (segment != null) {
        yield segment;
      }
    }
  }
}

export function matchAll(text: string, regex: RegExp) {
  // Reset the regex to start at the beginning of string, in case the regex has
  // been used before.
  // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec#finding_successive_matches
  regex.lastIndex = 0;
  return text.matchAll(regex);
}
