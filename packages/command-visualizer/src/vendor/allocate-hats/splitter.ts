/**
 * Standalone grapheme splitter — lifted from proseStandalone.ts in the
 * cursorless fork (SHA 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe), which in
 * turn mirrors the canonical splitter at
 * packages/cursorless-engine/src/tokenGraphemeSplitter/tokenGraphemeSplitter.ts:74
 * with a STATIC config (no ide().configuration): no lettersToPreserve /
 * symbolsToPreserve user overrides.
 */

import type { Grapheme, GraphemeSplitter } from "./common/types";

/**
 * Inline deburr — strips combining diacritics after NFC normalization.
 * Replaces lodash.deburr to keep the bundle free of lodash (whose CommonJS
 * module blows QuickJS's call stack).
 */
export function deburr(str: string): string {
  return (
    str
      .normalize("NFC")
      // eslint-disable-next-line no-misleading-character-class
      .replace(/[\u0300-\u036f\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g, "")
  );
}

const KNOWN_SYMBOLS = [
  "!",
  "#",
  "$",
  "%",
  "&",
  "'",
  "(",
  ")",
  "*",
  "+",
  ",",
  "-",
  ".",
  "/",
  ":",
  ";",
  "<",
  "=",
  ">",
  "?",
  "@",
  "[",
  "\\",
  "]",
  "^",
  "_",
  "`",
  "{",
  "|",
  "}",
  "~",
  "£",
  '"',
];
const UNKNOWN_GRAPHEME = "[unk]";
const KNOWN_GRAPHEME_MATCHER = new RegExp(
  `^([a-zA-Z0-9]|${KNOWN_SYMBOLS.map((s) =>
    s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  ).join("|")})$`,
  "u",
);

// Letters + combining marks OR any single Unicode Number / Punctuation / Symbol.
const GRAPHEME_SPLIT_SOURCE = String.raw`\p{L}\p{M}*|[\p{N}\p{P}\p{S}]`;
const GRAPHEME_SPLIT_FLAGS = "gu";

export class StandaloneGraphemeSplitter implements GraphemeSplitter {
  getTokenGraphemes(tokenText: string): Grapheme[] {
    const re = new RegExp(GRAPHEME_SPLIT_SOURCE, GRAPHEME_SPLIT_FLAGS);
    const results: Grapheme[] = [];
    let match: RegExpExecArray | null;
    while ((match = re.exec(tokenText)) != null) {
      results.push({
        text: this.normalizeGrapheme(match[0]),
        tokenStartOffset: match.index,
        tokenEndOffset: match.index + match[0].length,
      });
    }
    return results;
  }

  normalizeGrapheme(raw: string): string {
    let val = raw.normalize("NFC").toLowerCase();
    val = deburr(val);
    if (!KNOWN_GRAPHEME_MATCHER.test(val)) {
      val = UNKNOWN_GRAPHEME;
    }
    return val;
  }
}
