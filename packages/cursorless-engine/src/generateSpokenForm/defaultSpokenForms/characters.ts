/* eslint-disable @typescript-eslint/naming-convention */

import { NoSpokenFormError } from "../NoSpokenFormError";

// https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py

const alphabet = Object.fromEntries(
  "air bat cap drum each fine gust harp sit jury crunch look made near odd pit quench red sun trap urge vest whale plex yank zip"
    .split(" ")
    .map((word, index) => [
      String.fromCharCode("a".charCodeAt(0) + index),
      word,
    ]),
);

const digits = Object.fromEntries(
  "zero one two three four five six seven eight nine"
    .split(" ")
    .map((word, index) => [index.toString(), word]),
);

const symbols = {
  ".": "dot",
  ",": "comma",
  ";": "semicolon",
  ":": "colon",
  "!": "bang",
  "*": "asterisk",
  "@": "at sign",
  "&": "ampersand",
  "?": "question",
  "/": "slash",
  "\\": "backslash",
  "-": "dash",
  "=": "equals",
  "+": "plus",
  "~": "tilde",
  _: "underscore",
  "#": "hash",
  "%": "percent",
  "^": "caret",
  "|": "pipe",
  $: "dollar",
  "£": "pound",

  "'": "quote",
  '"': "double quote",
  "`": "back tick",

  "(": "paren",
  ")": "right paren",
  "{": "brace",
  "}": "right brace",
  "[": "square",
  "]": "right square",
  "<": "angle",
  ">": "right angle",

  "\uFFFD": "special",
};

const characters: Record<string, string> = {
  ...alphabet,
  ...digits,
  ...symbols,
};

export function characterToSpokenForm(char: string): string {
  const result = characters[char];
  if (result == null) {
    throw new NoSpokenFormError(`Unknown character '${char}'`);
  }
  return result;
}
