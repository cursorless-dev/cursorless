// https://github.com/talonhub/community/blob/9acb6c9659bb0c9b794a7b7126d025603b4ed726/core/keys/keys.py

const offset = "a".codePointAt(0)!;

const alphabet = Object.fromEntries(
  [
    "air",
    "bat",
    "cap",
    "drum",
    "each",
    "fine",
    "gust",
    "harp",
    "sit",
    "jury",
    "crunch",
    "look",
    "made",
    "near",
    "odd",
    "pit",
    "quench",
    "red",
    "sun",
    "trap",
    "urge",
    "vest",
    "whale",
    "plex",
    "yank",
    "zip",
  ].map((word, index) => [String.fromCodePoint(offset + index), word]),
);

const digits = Object.fromEntries(
  [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
  ].map((word, index) => [index.toString(), word]),
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
};

export const graphemeDefaultSpokenForms: Record<string, string> = {
  ...alphabet,
  ...digits,
  ...symbols,
};
