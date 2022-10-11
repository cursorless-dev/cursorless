import {
  getIdentifierMatcher,
  IDENTIFIERS_WORD_REGEX,
} from "../../core/tokenizer";
import { matchText } from "../../util/regex";

const camelRegex = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu;

export function subWordSplitter(text: string, languageId?: string) {
  // First split on identifiers. The input text can contain multiple
  // tokens/identifiers and these can have different formats.
  // eg `publicApiV1 public_api_v1`
  const identifiersRegex = getIdentifierMatcher(languageId);
  return matchText(text, identifiersRegex).flatMap((t) =>
    splitIdentifier(t.text, t.index)
  );
}

function splitIdentifier(text: string, index: number) {
  // First try to split on non letter characters
  const wordMatches = matchText(text, IDENTIFIERS_WORD_REGEX);

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
