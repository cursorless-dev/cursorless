/**
 * Standalone grapheme splitter — mirrors the canonical
 * @cursorless/lib-engine TokenGraphemeSplitter, but with a STATIC config: no
 * ide().configuration, so no lettersToPreserve / symbolsToPreserve user
 * overrides. The engine's class requires an IDE in its constructor (for the
 * live tokenHatSplittingMode setting), which this offline renderer has no way
 * to supply — hence this minimal reimplementation of getTokenGraphemes /
 * normalizeGrapheme rather than importing the class.
 *
 * The split regex itself is NOT cloned: GRAPHEME_SPLIT_REGEX is imported from
 * @cursorless/lib-engine (source of truth).
 */

import { GRAPHEME_SPLIT_REGEX } from "@cursorless/lib-engine";
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

export class StandaloneGraphemeSplitter implements GraphemeSplitter {
  getTokenGraphemes(tokenText: string): Grapheme[] {
    // Fresh RegExp per call: GRAPHEME_SPLIT_REGEX is a shared /gu instance whose
    // lastIndex would leak across calls if reused directly.
    const re = new RegExp(GRAPHEME_SPLIT_REGEX);
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
