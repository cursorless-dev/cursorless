import {
  IDENTIFIERS_REGEX,
  IDENTIFIERS_WORD_REGEX,
} from "../../core/tokenizer";
import { matchText } from "../../util/regex";

const identifiersRegex = new RegExp(IDENTIFIERS_REGEX, "gu");
const identifiersWordRegex = new RegExp(IDENTIFIERS_WORD_REGEX, "gu");
const camelRegex = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu;

export function subWordSplitter(text: string) {
  // First split on identifiers. The input text can contain multiple
  // tokens/identifiers and these can have different formats.
  // eg `publicApiV1 public_api_v1`
  return matchText(text, identifiersRegex).flatMap((t) =>
    splitIdentifier(t.text, t.index)
  );
}

function splitIdentifier(text: string, index: number) {
  // First try to split on non letter characters
  const wordMatches = matchText(text, identifiersWordRegex);

  const matches =
    wordMatches.length > 1
      ? wordMatches
      : // Secondly try split on camel case
        matchText(text, camelRegex);

  return matches.map((match) => ({
    index: index + match.index,
    text: match.text,
  }));
}
