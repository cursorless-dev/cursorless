import * as stringHelper from "./stringHelper";
import * as Match from "./Match";

const newline_placeholder = " @~@ ";
const newline_placeholder_t = newline_placeholder.trim();

const whiteSpaceCheck = new RegExp("\\S", "");
const addNewLineBoundaries = new RegExp("\\n+|[-#=_+*]{4,}", "g");
const splitIntoWords = new RegExp("\\S+|\\n", "g");

export interface SentenceParserOptions {
  newlineBoundaries?: boolean;
  preserveWhitespace?: boolean;
  abbreviations?: string[];
}

const defaultOptions: SentenceParserOptions = {
  newlineBoundaries: false,
  preserveWhitespace: false,
  abbreviations: undefined,
};

// Split the entry into sentences.
export function getSentences(
  text: string,
  userOptions?: SentenceParserOptions,
) {
  if (!text) {
    return [];
  }

  if (!whiteSpaceCheck.test(text)) {
    // whitespace-only string has no sentences
    return [];
  }

  const options: SentenceParserOptions = {
    ...defaultOptions,
    ...userOptions,
  };

  Match.setAbbreviations(options.abbreviations);

  if (options.newlineBoundaries) {
    text = text.replace(addNewLineBoundaries, newline_placeholder);
  }

  // Split the text into words
  let words: string[];
  let tokens: string[];

  // Split the text into words
  if (options.preserveWhitespace) {
    // <br> tags are the odd man out, as whitespace is allowed inside the tag
    tokens = text.split(/(<br\s*\/?>|\S+|\n+)/);

    // every other token is a word
    words = tokens.filter(function (token, ii) {
      return ii % 2;
    });
  } else {
    // - see http://blog.tompawlak.org/split-string-into-tokens-javascript
    words = text.trim().match(splitIntoWords) ?? [];
  }

  let wordCount = 0;
  let index = 0;
  let temp: string[] | boolean = [];
  let sentences = [];
  let current = [];

  // If given text is only whitespace (or nothing of \S+)
  if (!words || !words.length) {
    return [];
  }

  for (let i = 0, L = words.length; i < L; i++) {
    wordCount++;

    // Add the word to current sentence
    current.push(words[i]);

    // Sub-sentences, reset counter
    if (~words[i].indexOf(",")) {
      wordCount = 0;
    }

    if (
      Match.isBoundaryChar(words[i]) ||
      stringHelper.endsWithChar(words[i], "?!") ||
      words[i] === newline_placeholder_t
    ) {
      if (options.newlineBoundaries && words[i] === newline_placeholder_t) {
        current.pop();
      }

      sentences.push(current);

      wordCount = 0;
      current = [];

      continue;
    }

    if (
      stringHelper.endsWithChar(words[i], '"') ||
      stringHelper.endsWithChar(words[i], "”")
    ) {
      words[i] = words[i].slice(0, -1);
    }

    // A dot might indicate the end sentences
    // Exception: The next sentence starts with a word (non abbreviation)
    //            that has a capital letter.
    if (stringHelper.endsWithChar(words[i], ".")) {
      // Check if there is a next word
      // This probably needs to be improved with machine learning
      if (i + 1 < L) {
        // Single character abbr.
        if (
          words[i].length === 2 &&
          isNaN(words[i].charAt(0) as unknown as number)
        ) {
          continue;
        }

        // Common abbr. that often do not end sentences
        if (Match.isCommonAbbreviation(words[i])) {
          continue;
        }

        // Next word starts with capital word, but current sentence is
        // quite short
        if (Match.isSentenceStarter(words[i + 1])) {
          if (Match.isTimeAbbreviation(words[i], words[i + 1])) {
            continue;
          }

          // Dealing with names at the start of sentences
          if (Match.isNameAbbreviation(wordCount, words.slice(i, 6))) {
            continue;
          }

          if (Match.isNumber(words[i + 1])) {
            if (Match.isCustomAbbreviation(words[i])) {
              continue;
            }
          }
        } else {
          // Skip ellipsis
          if (stringHelper.endsWith(words[i], "..")) {
            continue;
          }

          //// Skip abbreviations
          // Short words + dot or a dot after each letter
          if (Match.isDottedAbbreviation(words[i])) {
            continue;
          }

          if (Match.isNameAbbreviation(wordCount, words.slice(i, 5))) {
            continue;
          }
        }
      }

      sentences.push(current);
      current = [];
      wordCount = 0;

      continue;
    }

    // Check if the word has a dot in it
    if ((index = words[i].indexOf(".")) > -1) {
      if (Match.isNumber(words[i], index)) {
        continue;
      }

      // Custom dotted abbreviations (like K.L.M or I.C.T)
      if (Match.isDottedAbbreviation(words[i])) {
        continue;
      }

      // Skip urls / emails and the like
      if (Match.isURL(words[i]) || Match.isPhoneNr(words[i])) {
        continue;
      }
    }

    if ((temp = Match.isConcatenated(words[i]))) {
      current.pop();
      current.push(temp[0]);
      sentences.push(current);

      current = [];
      wordCount = 0;
      current.push(temp[1]);
    }
  }

  if (current.length) {
    sentences.push(current);
  }

  // Clear "empty" sentences
  sentences = sentences.filter(function (s) {
    return s.length > 0;
  });

  const result = sentences.slice(1).reduce(
    function (out, sentence) {
      const lastSentence = out[out.length - 1];

      // Single words, could be "enumeration lists"
      if (lastSentence.length === 1 && /^.{1,2}[.]$/.test(lastSentence[0])) {
        // Check if there is a next sentence
        // It should not be another list item
        if (!/[.]/.test(sentence[0])) {
          out.pop();
          out.push(lastSentence.concat(sentence));
          return out;
        }
      }

      out.push(sentence);

      return out;
    },
    [sentences[0]],
  );

  // join tokens back together
  return result.map(function (sentence, ii) {
    if (options.preserveWhitespace && !options.newlineBoundaries) {
      // tokens looks like so: [leading-space token, non-space token, space
      // token, non-space token, space token... ]. In other words, the first
      // item is the leading space (or the empty string), and the rest of
      // the tokens are [non-space, space] token pairs.
      let tokenCount = sentence.length * 2;

      if (ii === 0) {
        tokenCount += 1;
      }

      return tokens.splice(0, tokenCount).join("");
    }

    return sentence.join(" ");
  });
}
