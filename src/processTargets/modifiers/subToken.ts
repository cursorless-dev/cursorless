import { IDENTIFIERS_REGEX } from "../../core/tokenizer";
import { matchAll } from "../../util/regex";

export const SUBWORD_MATCHER =
  /(?<=[^a-zA-Z])[a-zA-Z]+\d+|[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g;

const identifiersRegex = new RegExp(IDENTIFIERS_REGEX, "gu");
const nonLetterRegex = /[\p{L}\p{M}\d]+/gu;
const camelRegex = /[A-Z]?[a-z]+|[A-Z]+(?![a-z])|\d+/g;

export function subWordSplitter(text: string) {
  // First split on identifiers. The input text can contain multiple
  // tokens/identifiers and these can have different formats.
  // eg `publicApiV1 public_api_v1`
  return splitText(text, identifiersRegex).flatMap((t) =>
    splitIdentifier(t.text, t.index)
  );
}

function splitIdentifier(text: string, index: number) {
  // First try to split on non letter characters
  const nonLetterMatches = splitText(text, nonLetterRegex);

  const matches =
    nonLetterMatches.length > 1
      ? nonLetterMatches
      : // Secondly try split on camel case
        splitText(text, camelRegex);

  return matches.map((match) => ({
    index: index + match.index,
    text: match.text,
  }));
}

function splitText(text: string, regex: RegExp) {
  return matchAll(text, regex, (match) => ({
    index: match.index!,
    text: match[0],
  }));
}
