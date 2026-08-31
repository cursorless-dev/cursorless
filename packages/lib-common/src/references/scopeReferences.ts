import type {
  ScopeType,
  ScopeTypeType,
  SimpleScopeTypeType,
} from "../types/command/PartialTargetDescriptor.types";
import { simpleScopeTypeTypes } from "../types/command/PartialTargetDescriptor.types";
import {
  EVERY,
  ITEM,
  LINE,
  SET_SELECTION,
  STATEMENT,
  TARGET,
  TARGET_2,
  TARGET_2_DESC,
  TARGET_DESC,
  VAR_CHARACTER,
  VAR_PAIR,
  VAR_SPOKEN_FORM,
} from "./constants";
import { modifierExtraReferences } from "./modifierReferences";
import { pairedDelimiterReferences } from "./pairedDelimiterReferences";
import type { ReferenceEntry } from "./ReferenceEntry";
import type { ScopeReferenceGroupId } from "./scopeReferenceGroups";
import { connectiveDefaultSpokenForms } from "./spokenForms/connectiveDefaultSpokenForms";
import { graphemeDefaultSpokenForms } from "./spokenForms/graphemeDefaultSpokenForms";
import { ordinalDefaultSpokenForms } from "./spokenForms/numberDefaultSpokenForms";

interface ScopeReferenceEntry extends ReferenceEntry<ScopeReferenceGroupId> {
  /** Whether the scope is defined on a per-language basis. */
  isLanguageSpecific: boolean;

  /** Whether the scope is implemented by a dedicated modifier. */
  isPseudoScope?: boolean;

  /** The delimiter to use when inserting another instance of the scope. */
  defaultInsertionDelimiter?: string;
}

const DEFAULT_PATTERN = VAR_SPOKEN_FORM;

const AIR = graphemeDefaultSpokenForms.a;
const DOLLAR = graphemeDefaultSpokenForms["$"];
const PARENTHESIS = pairedDelimiterReferences.parentheses.defaultSpokenForm;
const NEXT = modifierExtraReferences.next.defaultSpokenForm;
const FIRST = modifierExtraReferences.first.defaultSpokenForm;
const LAST = modifierExtraReferences.last.defaultSpokenForm;
const PAST = connectiveDefaultSpokenForms.rangeInclusive;
const SECOND = ordinalDefaultSpokenForms[2];
const FOURTH = ordinalDefaultSpokenForms[4];

export const scopeReferences = {
  // Group: text
  character: {
    name: "Character",
    group: { id: "text", index: 0 },
    defaultSpokenForm: "char",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Single character within a token.",
        cheatsheet: "Character",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${FIRST} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the first character in the ${TARGET_DESC}.`,
      },
    ],
  },
  word: {
    name: "Sub token word",
    group: { id: "text", index: 1 },
    defaultSpokenForm: "sub",
    legacySpokenForms: ["word"],
    isLanguageSpecific: false,
    description:
      "Selects an individual word-like component within a camelCase, snake_case, or similarly structured token. It can be combined with ordinal and range modifiers to select one or more components.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Word-like component within a token, such as part of camelCase or snake_case.",
        cheatsheet: "Sub token word",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${FIRST} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the first sub token word in the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${SECOND} ${PAST} ${FOURTH} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the second through fourth sub token words in the ${TARGET_DESC}.`,
      },
    ],
  },
  token: {
    name: "Token",
    group: { id: "text", index: 2 },
    defaultSpokenForm: "token",
    isLanguageSpecific: false,
    description:
      "Expands the input to the nearest containing token. Without an explicit mark, it uses the token adjacent to the cursor or containing the current selection.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Token such as a word, number, or operator.",
        cheatsheet: "Token",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the ${TARGET_DESC}.`,
      },
    ],
  },
  identifier: {
    name: "Identifier",
    group: { id: "text", index: 3 },
    defaultSpokenForm: "identifier",
    isLanguageSpecific: false,
    description: `Like a token, but limited to text that can act as an identifier, such as \`foo\`, \`fooBar\`, or \`foo_bar\`; operators such as \`.\`, \`=\`, and \`+=\` are excluded. This scope is useful with ordinals such as \`${LAST} identifier\`.`,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Identifier-style sequence, such as camelCase, snake_case, or kebab-case.",
        cheatsheet: "Identifier",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the identifier containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sentence: {
    name: "Sentence",
    group: { id: "text", index: 4 },
    defaultSpokenForm: "sentence",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Text ending at sentence punctuation or a paragraph boundary.",
        cheatsheet: "Sentence",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the sentence containing the ${TARGET_DESC}.`,
      },
    ],
  },
  line: {
    name: "Line",
    group: { id: "text", index: 5 },
    defaultSpokenForm: LINE,
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Line, excluding indentation.",
        cheatsheet: "Line",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  fullLine: {
    name: "Full line",
    group: { id: "text", index: 6 },
    defaultSpokenForm: "full line",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Full line, including indentation.",
        cheatsheet: "Full line",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the full line containing the ${TARGET_DESC}.`,
      },
    ],
  },
  paragraph: {
    name: "Paragraph",
    group: { id: "text", index: 7 },
    defaultSpokenForm: "block",
    isLanguageSpecific: false,
    description:
      "Expands above and below the input through contiguous nonempty lines, stopping at empty lines.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Paragraph, contiguous non-empty lines around the target.",
        cheatsheet: "Paragraph",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the paragraph containing the ${TARGET_DESC}.`,
      },
    ],
  },
  boundedParagraph: {
    name: "Bounded paragraph",
    group: { id: "text", index: 8 },
    defaultSpokenForm: "short block",
    isLanguageSpecific: false,
    description:
      'Like `"block"`, but also stops at the boundary of a surrounding delimiter pair, so the selection does not escape the pair containing the input target.',
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Paragraph bounded by surrounding pair delimiters.",
        cheatsheet: "Paragraph bounded by surrounding pair delimiters",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the bounded paragraph containing the ${TARGET_DESC}.`,
      },
    ],
  },
  document: {
    name: "Document",
    group: { id: "text", index: 9 },
    defaultSpokenForm: "file",
    isLanguageSpecific: false,
    description: "The entire document, from the first to the last character.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Entire document.",
        cheatsheet: "Document",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the document containing the ${TARGET_DESC}.`,
      },
    ],
  },
  nonWhitespaceSequence: {
    name: "Non-whitespace sequence",
    group: { id: "text", index: 10 },
    defaultSpokenForm: "paint",
    isLanguageSpecific: false,
    description:
      "Expands forward and backward from the input through adjacent non-whitespace characters.",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Non-whitespace sequence.",
        cheatsheet: "Non-whitespace sequence",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the non-whitespace sequence containing the ${TARGET_DESC}.`,
      },
    ],
  },
  boundedNonWhitespaceSequence: {
    name: "Bounded non-whitespace sequence",
    group: { id: "text", index: 11 },
    defaultSpokenForm: "short paint",
    isLanguageSpecific: false,
    description:
      'Like `"paint"`, but expansion also stops at a delimiter pair that surrounds the input target. Delimiter pairs that do not surround the original target do not stop expansion.',
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Non-whitespace sequence bounded by surrounding pair delimiters.",
        cheatsheet:
          "Non-whitespace sequence bounded by surrounding pair delimiters",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the bounded non-whitespace sequence containing the ${TARGET_DESC}.`,
      },
    ],
  },
  url: {
    name: "URL",
    group: { id: "text", index: 12 },
    defaultSpokenForm: "link",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "URL / Web address.",
        cheatsheet: "URL",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the url containing the ${TARGET_DESC}.`,
      },
    ],
  },
  surroundingPair: {
    name: "Surrounding pair",
    group: { id: "text", index: 13 },
    isLanguageSpecific: false,
    description: `Expands the input to the nearest containing [paired delimiters](../paired-delimiters.md) and their contents. Use the [interior-only](../modifiers/interiorOnly.mdx) or [exclude-interior](../modifiers/excludeInterior.mdx) modifiers to select only the contents or only the delimiters.

When an opening and closing delimiter use the same character and no parse-tree information is available, Cursorless treats the first occurrence on each line as an opening delimiter and alternates subsequent occurrences between closing and opening delimiters.`,
    syntaxes: [
      {
        pattern: VAR_PAIR,
        description: "Surrounding matching delimiter pair and its contents.",
        cheatsheet: "Surrounding pair",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${PARENTHESIS} ${TARGET}`,
        description: `Selects the parentheses containing the ${TARGET_DESC}.`,
      },
    ],
  },
  glyph: {
    name: "Glyph",
    group: { id: "text", index: 14 },
    defaultSpokenForm: "glyph",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: `${VAR_SPOKEN_FORM} ${VAR_CHARACTER}`,
        description: `Instance of single character ${VAR_CHARACTER}.`,
        cheatsheet: `Instance of single character ${VAR_CHARACTER}`,
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${NEXT} ${VAR_SPOKEN_FORM} ${AIR}`,
        description: `Selects the next 'a'.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${VAR_SPOKEN_FORM} ${DOLLAR}`,
        description: `Selects every '$'.`,
      },
    ],
  },

  // Group: documentHierarchy
  part: {
    name: "Part",
    group: { id: "documentHierarchy", index: 0 },
    defaultSpokenForm: "part",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document part and its contents.",
        cheatsheet: "Part",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the part containing the ${TARGET_DESC}.`,
      },
    ],
  },
  chapter: {
    name: "Chapter",
    group: { id: "documentHierarchy", index: 1 },
    defaultSpokenForm: "chapter",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document chapter and its contents.",
        cheatsheet: "Chapter",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the chapter containing the ${TARGET_DESC}.`,
      },
    ],
  },
  subSection: {
    name: "Subsection",
    group: { id: "documentHierarchy", index: 2 },
    defaultSpokenForm: "subsection",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document subsection and its contents.",
        cheatsheet: "Subsection",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the subsection containing the ${TARGET_DESC}.`,
      },
    ],
  },
  subSubSection: {
    name: "Subsubsection",
    group: { id: "documentHierarchy", index: 3 },
    defaultSpokenForm: "subsubsection",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document subsubsection and its contents.",
        cheatsheet: "Subsubsection",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the subsubsection containing the ${TARGET_DESC}.`,
      },
    ],
  },
  namedParagraph: {
    name: "Named paragraph",
    group: { id: "documentHierarchy", index: 4 },
    defaultSpokenForm: "paragraph",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named document paragraph and its contents.",
        cheatsheet: "Named paragraph",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the named paragraph containing the ${TARGET_DESC}.`,
      },
    ],
  },
  subParagraph: {
    name: "Subparagraph",
    group: { id: "documentHierarchy", index: 5 },
    defaultSpokenForm: "subparagraph",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document subparagraph and its contents.",
        cheatsheet: "Subparagraph",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the subparagraph containing the ${TARGET_DESC}.`,
      },
    ],
  },
  environment: {
    name: "Environment",
    group: { id: "documentHierarchy", index: 6 },
    defaultSpokenForm: "environment",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named document environment and its contents.",
        cheatsheet: "Environment",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the environment containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: collections
  list: {
    name: "List",
    group: { id: "collections", index: 0 },
    defaultSpokenForm: "list",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "List or array.",
        cheatsheet: "List",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the list containing the ${TARGET_DESC}.`,
      },
    ],
  },
  map: {
    name: "Map",
    group: { id: "collections", index: 1 },
    defaultSpokenForm: "map",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Map, object, or dictionary.",
        cheatsheet: "Map",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the map containing the ${TARGET_DESC}.`,
      },
    ],
  },
  collectionItem: {
    name: "Collection item",
    group: { id: "collections", index: 2 },
    defaultSpokenForm: ITEM,
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Entry in a list, map, object, or similar collection.",
        cheatsheet: "Collection item",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the collection item containing the ${TARGET_DESC}.`,
      },
    ],
  },
  collectionKey: {
    name: "Collection key",
    group: { id: "collections", index: 3 },
    defaultSpokenForm: "key",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Key in a map, object, or dictionary.",
        cheatsheet: "Collection key",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the collection key containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: functions
  argumentOrParameter: {
    name: "Argument or parameter",
    group: { id: "functions", index: 0 },
    defaultSpokenForm: "arg",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function parameter or function-call argument.",
        cheatsheet: "Argument",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the argument or parameter containing the ${TARGET_DESC}.`,
      },
    ],
  },
  argumentList: {
    name: "Argument list",
    group: { id: "functions", index: 1 },
    defaultSpokenForm: "arg list",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Complete parameter or argument list.",
        cheatsheet: "Argument list",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the argument list containing the ${TARGET_DESC}.`,
      },
    ],
  },
  anonymousFunction: {
    name: "Anonymous function",
    group: { id: "functions", index: 2 },
    defaultSpokenForm: "lambda",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Anonymous or lambda function.",
        cheatsheet: "Anonymous function",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the anonymous function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  namedFunction: {
    name: "Named function",
    group: { id: "functions", index: 3 },
    defaultSpokenForm: "funk",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named function declaration.",
        cheatsheet: "Named function",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the named function containing the ${TARGET_DESC}.`,
      },
    ],
  },
  functionName: {
    name: "Function name",
    group: { id: "functions", index: 4 },
    defaultSpokenForm: "funk name",
    isLanguageSpecific: true,
    isPseudoScope: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Name in a function declaration.",
        cheatsheet: "Function name",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the function name containing the ${TARGET_DESC}.`,
      },
    ],
  },
  functionCall: {
    name: "Function call",
    group: { id: "functions", index: 5 },
    defaultSpokenForm: "call",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function, method, or constructor call.",
        cheatsheet: "Function call",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the function call containing the ${TARGET_DESC}.`,
      },
    ],
  },
  functionCallee: {
    name: "Function callee",
    group: { id: "functions", index: 6 },
    defaultSpokenForm: "callee",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Expression invoked by a function call.",
        cheatsheet: "Function callee",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the function callee containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: objects
  class: {
    name: "Class",
    group: { id: "objects", index: 0 },
    defaultSpokenForm: "class",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Class or struct declaration or definition.",
        cheatsheet: "Class",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the class containing the ${TARGET_DESC}.`,
      },
    ],
  },
  className: {
    name: "Class name",
    group: { id: "objects", index: 1 },
    defaultSpokenForm: "class name",
    isLanguageSpecific: true,
    isPseudoScope: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Name in a class or struct declaration.",
        cheatsheet: "Class name",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the class name containing the ${TARGET_DESC}.`,
      },
    ],
  },
  instance: {
    name: "Instance",
    group: { id: "objects", index: 2 },
    defaultSpokenForm: "instance",
    isLanguageSpecific: true,
    isPseudoScope: true,
    description: `Searches for occurrences of the input target's text. Instance matching preserves the target's scope type, so an instance of a token only matches complete tokens rather than substrings within larger tokens; apply [\`"just"\`](../modifiers/toRawSelection.mdx) to match the raw text instead.

For a range target, the entire range becomes the search text. Without an explicit mark, Cursorless uses the token touching the cursor. Use [\`"from"\`](../actions/setInstanceReference.mdx) to restrict the search region or choose its starting point.`,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Occurrence matching the current instance.",
        cheatsheet: "Instance",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${EVERY} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects every instance of the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${VAR_SPOKEN_FORM} ${TARGET} ${PAST} ${TARGET_2}`,
        description: `Selects every occurrence of the text spanning from the ${TARGET_DESC} through the ${TARGET_2_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${NEXT} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the next instance of the ${TARGET_DESC}.`,
      },
      {
        command: `${SET_SELECTION} ${EVERY} ${VAR_SPOKEN_FORM}`,
        description: "Selects every instance of the token touching the cursor.",
      },
    ],
  },
  name: {
    name: "Name",
    group: { id: "objects", index: 3 },
    defaultSpokenForm: "name",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Name in a declaration, such as a variable or function name.",
        cheatsheet: "Name",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the name containing the ${TARGET_DESC}.`,
      },
    ],
  },
  attribute: {
    name: "Attribute",
    group: { id: "objects", index: 4 },
    defaultSpokenForm: "attribute",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Attribute, such as one on an HTML element.",
        cheatsheet: "Attribute",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the attribute containing the ${TARGET_DESC}.`,
      },
    ],
  },
  type: {
    name: "Type",
    group: { id: "objects", index: 5 },
    defaultSpokenForm: "type",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Type annotation or declaration.",
        cheatsheet: "Type",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the type containing the ${TARGET_DESC}.`,
      },
    ],
  },
  value: {
    name: "Value",
    group: { id: "objects", index: 6 },
    defaultSpokenForm: "value",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Value in an assignment, collection entry, return statement, or similar construct.",
        cheatsheet: "Value",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the value containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: statements
  statement: {
    name: "Statement",
    group: { id: "statements", index: 0 },
    defaultSpokenForm: STATEMENT,
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Complete statement, such as a variable declaration or expression statement.",
        cheatsheet: "Statement",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the statement containing the ${TARGET_DESC}.`,
      },
    ],
  },
  branch: {
    name: "Branch",
    group: { id: "statements", index: 1 },
    defaultSpokenForm: "branch",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Branch of a control-flow construct, such as if, try, switch, or ternary.",
        cheatsheet: "Branch",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the branch containing the ${TARGET_DESC}.`,
      },
    ],
  },
  ifStatement: {
    name: "If statement",
    group: { id: "statements", index: 2 },
    defaultSpokenForm: "if state",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Complete if statement.",
        cheatsheet: "If statement",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the if statement containing the ${TARGET_DESC}.`,
      },
    ],
  },
  condition: {
    name: "Condition",
    group: { id: "statements", index: 3 },
    defaultSpokenForm: "condition",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Condition of a conditional, loop, or similar construct.",
        cheatsheet: "Condition",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the condition containing the ${TARGET_DESC}.`,
      },
    ],
  },
  comment: {
    name: "Comment",
    group: { id: "statements", index: 4 },
    defaultSpokenForm: "comment",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Line or block comment.",
        cheatsheet: "Comment",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the comment containing the ${TARGET_DESC}.`,
      },
    ],
  },
  command: {
    name: "Command",
    group: { id: "statements", index: 5 },
    defaultSpokenForm: "command",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Command, such as a Talon spoken command or shell command.",
        cheatsheet: "Command",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the command containing the ${TARGET_DESC}.`,
      },
    ],
  },
  regularExpression: {
    name: "Regular expression",
    group: { id: "statements", index: 6 },
    defaultSpokenForm: "regex",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Regular-expression literal.",
        cheatsheet: "Regular expression",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the regular expression containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: markup
  xmlElement: {
    name: "XML element",
    group: { id: "markup", index: 0 },
    defaultSpokenForm: "element",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Complete XML, HTML, or JSX element, or a LaTeX environment.",
        cheatsheet: "XML element",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the XML element containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlStartTag: {
    name: "XML start tag",
    group: { id: "markup", index: 1 },
    defaultSpokenForm: "start tag",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Opening XML, HTML, or JSX tag, or LaTeX `begin` command.",
        cheatsheet: "XML start tag",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the XML start tag containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlEndTag: {
    name: "XML end tag",
    group: { id: "markup", index: 2 },
    defaultSpokenForm: "end tag",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Closing XML, HTML, or JSX tag, or LaTeX `end` command.",
        cheatsheet: "XML end tag",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the XML end tag containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlBothTags: {
    name: "XML both tags",
    group: { id: "markup", index: 3 },
    defaultSpokenForm: "tags",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Opening and closing XML, HTML, or JSX tags, or LaTeX `begin` and `end` commands.",
        cheatsheet: "XML start and end tags",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects both tags of the XML element containing the ${TARGET_DESC}.`,
      },
    ],
  },
  selector: {
    name: "Selector",
    group: { id: "markup", index: 4 },
    defaultSpokenForm: "selector",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "CSS selector.",
        cheatsheet: "Selector",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the selector containing the ${TARGET_DESC}.`,
      },
    ],
  },
  unit: {
    name: "Unit",
    group: { id: "markup", index: 5 },
    defaultSpokenForm: "unit",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Unit suffix in a measurement, such as `px` in `100px`.",
        cheatsheet: "Unit",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the unit containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: sections
  section: {
    name: "Section",
    group: { id: "sections", index: 0 },
    defaultSpokenForm: "section",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Heading and its content through the next heading of the same or higher level.",
        cheatsheet: "Section",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelOne: {
    name: "Section level one",
    group: { id: "sections", index: 1 },
    defaultSpokenForm: "one section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-one heading and its content.",
        cheatsheet: "Section level one",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level one containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelTwo: {
    name: "Section level two",
    group: { id: "sections", index: 2 },
    defaultSpokenForm: "two section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-two heading and its content.",
        cheatsheet: "Section level two",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level two containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelThree: {
    name: "Section level three",
    group: { id: "sections", index: 3 },
    defaultSpokenForm: "three section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-three heading and its content.",
        cheatsheet: "Section level three",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level three containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelFour: {
    name: "Section level four",
    group: { id: "sections", index: 4 },
    defaultSpokenForm: "four section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-four heading and its content.",
        cheatsheet: "Section level four",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level four containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelFive: {
    name: "Section level five",
    group: { id: "sections", index: 5 },
    defaultSpokenForm: "five section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-five heading and its content.",
        cheatsheet: "Section level five",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level five containing the ${TARGET_DESC}.`,
      },
    ],
  },
  sectionLevelSix: {
    name: "Section level six",
    group: { id: "sections", index: 6 },
    defaultSpokenForm: "six section",
    visibility: "disabledByDefault",
    isLanguageSpecific: true,
    defaultInsertionDelimiter: "\n\n",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Level-six heading and its content.",
        cheatsheet: "Section level six",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the section level six containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: notebook
  notebookCell: {
    name: "Notebook cell",
    group: { id: "notebook", index: 0 },
    defaultSpokenForm: "cell",
    isLanguageSpecific: false,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Notebook cell or Markdown fenced code block.",
        cheatsheet: "Notebook cell",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the notebook cell containing the ${TARGET_DESC}.`,
      },
    ],
  },

  // Group: private
  "private.fieldAccess": {
    name: "Field access",
    group: { id: "private", index: 0 },
    defaultSpokenForm: "access",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Field access.",
        cheatsheet: "Field access",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the field access containing the ${TARGET_DESC}.`,
      },
    ],
  },
  string: {
    name: "String",
    group: { id: "private", index: 1 },
    defaultSpokenForm: "parse tree string",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "String.",
        cheatsheet: "String",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the string containing the ${TARGET_DESC}.`,
      },
    ],
  },
  textFragment: {
    name: "Text fragment",
    group: { id: "private", index: 2 },
    defaultSpokenForm: "text fragment",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Text fragment.",
        cheatsheet: "Text fragment",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the text fragment containing the ${TARGET_DESC}.`,
      },
    ],
  },
  disqualifyDelimiter: {
    name: "Disqualify delimiter",
    group: { id: "private", index: 3 },
    defaultSpokenForm: "disqualify delimiter",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Disqualify delimiter.",
        cheatsheet: "Disqualify delimiter",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the disqualify delimiter containing the ${TARGET_DESC}.`,
      },
    ],
  },
  pairDelimiter: {
    name: "Pair delimiter",
    group: { id: "private", index: 4 },
    defaultSpokenForm: "pair delimiter",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Pair delimiter.",
        cheatsheet: "Pair delimiter",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the pair delimiter containing the ${TARGET_DESC}.`,
      },
    ],
  },
  interior: {
    name: "Interior",
    group: { id: "private", index: 5 },
    defaultSpokenForm: "interior",
    visibility: "private",
    isLanguageSpecific: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Interior.",
        cheatsheet: "Interior",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the interior containing the ${TARGET_DESC}.`,
      },
    ],
  },
  surroundingPairInterior: {
    name: "Surrounding pair interior",
    group: { id: "private", index: 6 },
    visibility: "private",
    isLanguageSpecific: false,
    syntaxes: [],
    examples: [],
  },
  customRegex: {
    name: "Custom regex",
    group: { id: "private", index: 7 },
    visibility: "private",
    isLanguageSpecific: false,
    syntaxes: [],
    examples: [],
  },
} as const satisfies Record<ScopeTypeType, ScopeReferenceEntry>;

export const pseudoScopeTypeTypes = new Set<SimpleScopeTypeType>(
  simpleScopeTypeTypes.filter((scopeType) => {
    const reference: ScopeReferenceEntry = scopeReferences[scopeType];
    return reference.isPseudoScope;
  }),
);

export function isPseudoScopeType(scopeType: ScopeType): boolean {
  const reference: ScopeReferenceEntry = scopeReferences[scopeType.type];
  return reference.isPseudoScope ?? false;
}

export function getDefaultInsertionDelimiter(
  scopeType: SimpleScopeTypeType,
): string {
  const reference: ScopeReferenceEntry = scopeReferences[scopeType];
  return reference.defaultInsertionDelimiter ?? " ";
}
