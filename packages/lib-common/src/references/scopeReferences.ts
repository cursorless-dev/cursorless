import type { ScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import {
  EVERY,
  ITEM,
  LINE,
  SET_SELECTION,
  STATEMENT,
  TARGET,
  TARGET_DESC,
  VAR_CHARACTER,
  VAR_PAIR,
  VAR_SPOKEN_FORM,
} from "./constants";
import { pairedDelimiterReferences } from "./pairedDelimiterReferences";
import type { ReferenceEntry } from "./ReferenceEntry";
import type { ScopeReferenceGroupId } from "./scopeReferenceGroups";
import { connectiveDefaultSpokenForms } from "./spokenForms/connectiveDefaultSpokenForms";
import { graphemeDefaultSpokenForms } from "./spokenForms/graphemeDefaultSpokenForms";

const DEFAULT_PATTERN = VAR_SPOKEN_FORM;

const AIR = graphemeDefaultSpokenForms.a;
const PARENTHESIS = pairedDelimiterReferences.parentheses.defaultSpokenForm;
const NEXT = connectiveDefaultSpokenForms.next;
const FIRST = connectiveDefaultSpokenForms.first;

export const scopeReferences = {
  // Group: tokens
  character: {
    name: "Character",
    group: { id: "tokens", index: 0 },
    defaultSpokenForm: "char",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Character.",
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
    group: { id: "tokens", index: 1 },
    defaultSpokenForm: "sub",
    legacySpokenForms: ["word"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Sub token word.",
        cheatsheet: "Sub token word",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${FIRST} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the first sub token word in the ${TARGET_DESC}.`,
      },
    ],
  },
  token: {
    name: "Token",
    group: { id: "tokens", index: 2 },
    defaultSpokenForm: "token",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Token.",
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
    group: { id: "tokens", index: 3 },
    defaultSpokenForm: "identifier",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Identifier.",
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
  glyph: {
    name: "Glyph",
    group: { id: "tokens", index: 4 },
    defaultSpokenForm: "glyph",
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
    ],
  },
  nonWhitespaceSequence: {
    name: "Non-whitespace sequence",
    group: { id: "tokens", index: 5 },
    defaultSpokenForm: "paint",
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
    group: { id: "tokens", index: 6 },
    defaultSpokenForm: "short paint",
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
    group: { id: "tokens", index: 7 },
    defaultSpokenForm: "link",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "URL.",
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
  regularExpression: {
    name: "Regular expression",
    group: { id: "tokens", index: 8 },
    defaultSpokenForm: "regex",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Regular expression.",
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

  // Group: text
  line: {
    name: "Line",
    group: { id: "text", index: 0 },
    defaultSpokenForm: LINE,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Line.",
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
    group: { id: "text", index: 1 },
    defaultSpokenForm: "full line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Full line.",
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
  sentence: {
    name: "Sentence",
    group: { id: "text", index: 2 },
    defaultSpokenForm: "sentence",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Sentence.",
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
  paragraph: {
    name: "Paragraph",
    group: { id: "text", index: 3 },
    defaultSpokenForm: "block",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Paragraph.",
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
    group: { id: "text", index: 4 },
    defaultSpokenForm: "short block",
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
    group: { id: "text", index: 5 },
    defaultSpokenForm: "file",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document.",
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
  notebookCell: {
    name: "Notebook cell",
    group: { id: "text", index: 6 },
    defaultSpokenForm: "cell",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Notebook cell.",
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

  // Group: functions
  argumentOrParameter: {
    name: "Argument or parameter",
    group: { id: "functions", index: 0 },
    defaultSpokenForm: "arg",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Argument.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Argument list.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Anonymous function.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named function.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function name.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function call.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function callee.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Class.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Class name.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Instance.",
        cheatsheet: "Instance",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${EVERY} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects every instance of the ${TARGET_DESC}.`,
      },
    ],
  },
  name: {
    name: "Name",
    group: { id: "objects", index: 3 },
    defaultSpokenForm: "name",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Name.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Attribute.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Type.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Value.",
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

  // Group: collections
  list: {
    name: "List",
    group: { id: "collections", index: 0 },
    defaultSpokenForm: "list",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "List.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Map.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Collection item.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Collection key.",
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

  // Group: statements
  statement: {
    name: "Statement",
    group: { id: "statements", index: 0 },
    defaultSpokenForm: STATEMENT,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Statement.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Branch.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "If statement.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Condition.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Comment.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Command.",
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

  // Group: markup
  xmlElement: {
    name: "XML element",
    group: { id: "markup", index: 0 },
    defaultSpokenForm: "element",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML element.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML start tag.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML end tag.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML start and end tags.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Selector.",
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
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Unit.",
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

  // Group: documentStructure
  section: {
    name: "Section",
    group: { id: "documentStructure", index: 0 },
    defaultSpokenForm: "section",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section.",
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
    group: { id: "documentStructure", index: 1 },
    defaultSpokenForm: "one section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level one.",
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
    group: { id: "documentStructure", index: 2 },
    defaultSpokenForm: "two section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level two.",
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
    group: { id: "documentStructure", index: 3 },
    defaultSpokenForm: "three section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level three.",
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
    group: { id: "documentStructure", index: 4 },
    defaultSpokenForm: "four section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level four.",
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
    group: { id: "documentStructure", index: 5 },
    defaultSpokenForm: "five section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level five.",
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
    group: { id: "documentStructure", index: 6 },
    defaultSpokenForm: "six section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level six.",
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
  part: {
    name: "Part",
    group: { id: "documentStructure", index: 7 },
    defaultSpokenForm: "part",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Part.",
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
    group: { id: "documentStructure", index: 8 },
    defaultSpokenForm: "chapter",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Chapter.",
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
    group: { id: "documentStructure", index: 9 },
    defaultSpokenForm: "subsection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subsection.",
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
    group: { id: "documentStructure", index: 10 },
    defaultSpokenForm: "subsubsection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subsubsection.",
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
    group: { id: "documentStructure", index: 11 },
    defaultSpokenForm: "paragraph",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named paragraph.",
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
    group: { id: "documentStructure", index: 12 },
    defaultSpokenForm: "subparagraph",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subparagraph.",
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
    group: { id: "documentStructure", index: 13 },
    defaultSpokenForm: "environment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Environment.",
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

  // Group: delimiters
  surroundingPair: {
    name: "Surrounding pair",
    group: { id: "delimiters", index: 0 },
    syntaxes: [
      {
        pattern: VAR_PAIR,
        description: "Surrounding pair.",
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

  // Group: private
  "private.fieldAccess": {
    name: "Field access",
    group: { id: "private", index: 0 },
    defaultSpokenForm: "access",
    private: true,
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
    private: true,
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
    private: true,
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
    private: true,
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
    private: true,
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
    private: true,
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
    private: true,
    syntaxes: [],
    examples: [],
  },
  customRegex: {
    name: "Custom regex",
    group: { id: "private", index: 7 },
    private: true,
    syntaxes: [],
    examples: [],
  },
} as const satisfies Record<
  ScopeTypeType,
  ReferenceEntry<ScopeReferenceGroupId>
>;
