import type { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import type { ReferenceEntry } from "./ReferenceEntry";

const DEFAULT_PATTERN = "<spokenForm>";

type AdditionalScopeReferenceType = "glyph" | "pair";

export const scopeReferences: Record<
  SimpleScopeTypeType | AdditionalScopeReferenceType,
  ReferenceEntry
> = {
  argumentOrParameter: {
    name: "Argument",
    defaultSpokenForm: "arg",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Argument",
        cheatsheet: "Argument",
      },
    ],
    examples: [],
  },
  argumentList: {
    name: "Argument list",
    defaultSpokenForm: "arg list",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Argument list",
        cheatsheet: "Argument list",
      },
    ],
    examples: [],
  },
  anonymousFunction: {
    name: "Anonymous function",
    defaultSpokenForm: "lambda",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Anonymous function",
        cheatsheet: "Anonymous function",
      },
    ],
    examples: [],
  },
  attribute: {
    name: "Attribute",
    defaultSpokenForm: "attribute",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Attribute",
        cheatsheet: "Attribute",
      },
    ],
    examples: [],
  },
  branch: {
    name: "Branch",
    defaultSpokenForm: "branch",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Branch",
        cheatsheet: "Branch",
      },
    ],
    examples: [],
  },
  class: {
    name: "Class",
    defaultSpokenForm: "class",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Class",
        cheatsheet: "Class",
      },
    ],
    examples: [],
  },
  className: {
    name: "Class name",
    defaultSpokenForm: "class name",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Class name",
        cheatsheet: "Class name",
      },
    ],
    examples: [],
  },
  collectionItem: {
    name: "Collection item",
    defaultSpokenForm: "item",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Collection item",
        cheatsheet: "Collection item",
      },
    ],
    examples: [],
  },
  collectionKey: {
    name: "Collection key",
    defaultSpokenForm: "key",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Collection key",
        cheatsheet: "Collection key",
      },
    ],
    examples: [],
  },
  comment: {
    name: "Comment",
    defaultSpokenForm: "comment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Comment",
        cheatsheet: "Comment",
      },
    ],
    examples: [],
  },
  "private.fieldAccess": {
    name: "Field access",
    defaultSpokenForm: "access",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Field access",
        cheatsheet: "Field access",
      },
    ],
    examples: [],
  },
  functionCall: {
    name: "Function call",
    defaultSpokenForm: "call",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function call",
        cheatsheet: "Function call",
      },
    ],
    examples: [],
  },
  functionCallee: {
    name: "Function callee",
    defaultSpokenForm: "callee",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function callee",
        cheatsheet: "Function callee",
      },
    ],
    examples: [],
  },
  functionName: {
    name: "Function name",
    defaultSpokenForm: "funk name",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Function name",
        cheatsheet: "Function name",
      },
    ],
    examples: [],
  },
  ifStatement: {
    name: "If statement",
    defaultSpokenForm: "if state",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "If statement",
        cheatsheet: "If statement",
      },
    ],
    examples: [],
  },
  instance: {
    name: "Instance",
    defaultSpokenForm: "instance",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Instance",
        cheatsheet: "Instance",
      },
    ],
    examples: [],
  },
  list: {
    name: "List",
    defaultSpokenForm: "list",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "List",
        cheatsheet: "List",
      },
    ],
    examples: [],
  },
  map: {
    name: "Map",
    defaultSpokenForm: "map",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Map",
        cheatsheet: "Map",
      },
    ],
    examples: [],
  },
  name: {
    name: "Name",
    defaultSpokenForm: "name",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Name",
        cheatsheet: "Name",
      },
    ],
    examples: [],
  },
  namedFunction: {
    name: "Named function",
    defaultSpokenForm: "funk",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named function",
        cheatsheet: "Named function",
      },
    ],
    examples: [],
  },
  regularExpression: {
    name: "Regular expression",
    defaultSpokenForm: "regex",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Regular expression",
        cheatsheet: "Regular expression",
      },
    ],
    examples: [],
  },
  statement: {
    name: "Statement",
    defaultSpokenForm: "state",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Statement",
        cheatsheet: "Statement",
      },
    ],
    examples: [],
  },
  string: {
    name: "String",
    defaultSpokenForm: "parse tree string",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "String",
        cheatsheet: "String",
      },
    ],
    examples: [],
  },
  type: {
    name: "Type",
    defaultSpokenForm: "type",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Type",
        cheatsheet: "Type",
      },
    ],
    examples: [],
  },
  value: {
    name: "Value",
    defaultSpokenForm: "value",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Value",
        cheatsheet: "Value",
      },
    ],
    examples: [],
  },
  condition: {
    name: "Condition",
    defaultSpokenForm: "condition",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Condition",
        cheatsheet: "Condition",
      },
    ],
    examples: [],
  },
  section: {
    name: "Section",
    defaultSpokenForm: "section",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section",
        cheatsheet: "Section",
      },
    ],
    examples: [],
  },
  sectionLevelOne: {
    name: "Section level one",
    defaultSpokenForm: "one section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level one",
        cheatsheet: "Section level one",
      },
    ],
    examples: [],
  },
  sectionLevelTwo: {
    name: "Section level two",
    defaultSpokenForm: "two section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level two",
        cheatsheet: "Section level two",
      },
    ],
    examples: [],
  },
  sectionLevelThree: {
    name: "Section level three",
    defaultSpokenForm: "three section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level three",
        cheatsheet: "Section level three",
      },
    ],
    examples: [],
  },
  sectionLevelFour: {
    name: "Section level four",
    defaultSpokenForm: "four section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level four",
        cheatsheet: "Section level four",
      },
    ],
    examples: [],
  },
  sectionLevelFive: {
    name: "Section level five",
    defaultSpokenForm: "five section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level five",
        cheatsheet: "Section level five",
      },
    ],
    examples: [],
  },
  sectionLevelSix: {
    name: "Section level six",
    defaultSpokenForm: "six section",
    disabledByDefault: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Section level six",
        cheatsheet: "Section level six",
      },
    ],
    examples: [],
  },
  selector: {
    name: "Selector",
    defaultSpokenForm: "selector",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Selector",
        cheatsheet: "Selector",
      },
    ],
    examples: [],
  },
  unit: {
    name: "Unit",
    defaultSpokenForm: "unit",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Unit",
        cheatsheet: "Unit",
      },
    ],
    examples: [],
  },
  xmlBothTags: {
    name: "XML both tags",
    defaultSpokenForm: "tags",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML both tags",
        cheatsheet: "XML both tags",
      },
    ],
    examples: [],
  },
  xmlElement: {
    name: "XML element",
    defaultSpokenForm: "element",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML element",
        cheatsheet: "XML element",
      },
    ],
    examples: [],
  },
  xmlEndTag: {
    name: "XML end tag",
    defaultSpokenForm: "end tag",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML end tag",
        cheatsheet: "XML end tag",
      },
    ],
    examples: [],
  },
  xmlStartTag: {
    name: "XML start tag",
    defaultSpokenForm: "start tag",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML start tag",
        cheatsheet: "XML start tag",
      },
    ],
    examples: [],
  },
  part: {
    name: "Part",
    defaultSpokenForm: "part",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Part",
        cheatsheet: "Part",
      },
    ],
    examples: [],
  },
  chapter: {
    name: "Chapter",
    defaultSpokenForm: "chapter",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Chapter",
        cheatsheet: "Chapter",
      },
    ],
    examples: [],
  },
  subSection: {
    name: "Subsection",
    defaultSpokenForm: "subsection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subsection",
        cheatsheet: "Subsection",
      },
    ],
    examples: [],
  },
  subSubSection: {
    name: "Subsubsection",
    defaultSpokenForm: "subsubsection",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subsubsection",
        cheatsheet: "Subsubsection",
      },
    ],
    examples: [],
  },
  namedParagraph: {
    name: "Named paragraph",
    defaultSpokenForm: "paragraph",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Named paragraph",
        cheatsheet: "Named paragraph",
      },
    ],
    examples: [],
  },
  subParagraph: {
    name: "Subparagraph",
    defaultSpokenForm: "subparagraph",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Subparagraph",
        cheatsheet: "Subparagraph",
      },
    ],
    examples: [],
  },
  environment: {
    name: "Environment",
    defaultSpokenForm: "environment",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Environment",
        cheatsheet: "Environment",
      },
    ],
    examples: [],
  },
  character: {
    name: "Character",
    defaultSpokenForm: "char",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Character",
        cheatsheet: "Character",
      },
    ],
    examples: [],
  },
  word: {
    name: "Sub token word",
    defaultSpokenForm: "sub",
    legacySpokenForms: ["word"],
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Sub token word",
        cheatsheet: "Sub token word",
      },
    ],
    examples: [],
  },
  token: {
    name: "Token",
    defaultSpokenForm: "token",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Token",
        cheatsheet: "Token",
      },
    ],
    examples: [],
  },
  identifier: {
    name: "Identifier",
    defaultSpokenForm: "identifier",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Identifier",
        cheatsheet: "Identifier",
      },
    ],
    examples: [],
  },
  line: {
    name: "Line",
    defaultSpokenForm: "line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Line",
        cheatsheet: "Line",
      },
    ],
    examples: [],
  },
  fullLine: {
    name: "Full line",
    defaultSpokenForm: "full line",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Full line",
        cheatsheet: "Full line",
      },
    ],
    examples: [],
  },
  sentence: {
    name: "Sentence",
    defaultSpokenForm: "sentence",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Sentence",
        cheatsheet: "Sentence",
      },
    ],
    examples: [],
  },
  paragraph: {
    name: "Paragraph",
    defaultSpokenForm: "block",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Paragraph",
        cheatsheet: "Paragraph",
      },
    ],
    examples: [],
  },
  boundedParagraph: {
    name: "Bounded paragraph",
    defaultSpokenForm: "short block",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Paragraph bounded by surrounding pair delimeters",
        cheatsheet: "Paragraph bounded by surrounding pair delimeters",
      },
    ],
    examples: [],
  },
  document: {
    name: "Document",
    defaultSpokenForm: "file",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Document",
        cheatsheet: "Document",
      },
    ],
    examples: [],
  },
  nonWhitespaceSequence: {
    name: "Non-whitespace sequence",
    defaultSpokenForm: "paint",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Non-whitespace sequence",
        cheatsheet: "Non-whitespace sequence",
      },
    ],
    examples: [],
  },
  boundedNonWhitespaceSequence: {
    name: "Bounded non-whitespace sequence",
    defaultSpokenForm: "short paint",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description:
          "Non-whitespace sequence bounded by surrounding pair delimeters",
        cheatsheet:
          "Non-whitespace sequence bounded by surrounding pair delimeters",
      },
    ],
    examples: [],
  },
  url: {
    name: "URL",
    defaultSpokenForm: "link",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "URL",
        cheatsheet: "URL",
      },
    ],
    examples: [],
  },
  notebookCell: {
    name: "Notebook cell",
    defaultSpokenForm: "cell",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Notebook cell",
        cheatsheet: "Notebook cell",
      },
    ],
    examples: [],
  },
  command: {
    name: "Command",
    defaultSpokenForm: "command",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Command",
        cheatsheet: "Command",
      },
    ],
    examples: [],
  },
  textFragment: {
    name: "Text fragment",
    defaultSpokenForm: "text fragment",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Text fragment",
        cheatsheet: "Text fragment",
      },
    ],
    examples: [],
  },
  disqualifyDelimiter: {
    name: "Disqualify delimiter",
    defaultSpokenForm: "disqualify delimiter",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Disqualify delimiter",
        cheatsheet: "Disqualify delimiter",
      },
    ],
    examples: [],
  },
  pairDelimiter: {
    name: "Pair delimiter",
    defaultSpokenForm: "pair delimiter",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Pair delimiter",
        cheatsheet: "Pair delimiter",
      },
    ],
    examples: [],
  },
  interior: {
    name: "Interior",
    defaultSpokenForm: "interior",
    private: true,
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "Interior",
        cheatsheet: "Interior",
      },
    ],
    examples: [],
  },
  glyph: {
    name: "Glyph",
    defaultSpokenForm: "glyph",
    syntaxes: [
      {
        pattern: "<spokenForm> <character>",
        description: "Instance of single character <character>",
        cheatsheet: "Instance of single character <character>",
      },
    ],
    examples: [],
  },
  pair: {
    name: "Paired delimiters",
    syntaxes: [
      {
        pattern: "<pair>",
        description: "Paired delimiters",
        cheatsheet: "Paired delimiters",
      },
    ],
    examples: [],
  },
};
