import { getMatcher } from "../../core/tokenizer";
import { matchText } from "../../util/regex";

const camelRegex = /\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu;

export function subWordSplitter(text: string, languageId: string) {
  // First split on identifiers. The input text can contain multiple
  // tokens/identifiers and these can have different formats.
  // eg `publicApiV1 public_api_v1`
  const { identifierMatcher, wordMatcher } = getMatcher(languageId);
  return matchText(text, identifierMatcher).flatMap((t) =>
    splitIdentifier(wordMatcher, t.text, t.index)
  );
}

function splitIdentifier(wordMatcher: RegExp, text: string, index: number) {
  // First try to split on non letter characters
  const wordMatches = matchText(text, wordMatcher);

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
