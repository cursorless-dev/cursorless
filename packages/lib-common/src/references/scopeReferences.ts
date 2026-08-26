import type { SimpleScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import type {
  ReferenceEntry,
  ReferenceEntryWithoutIdKind,
} from "../types/ReferenceEntry";

const DEFAULT_PATTERN = "<spokenForm>";

type AdditionalScopeReferenceType = "glyph" | "pair";

const scopeReferencesMap: Record<
  SimpleScopeTypeType | AdditionalScopeReferenceType,
  ReferenceEntryWithoutIdKind
> = {
  argumentOrParameter: {
    name: "Argument",
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

export const scopeReferences: ReferenceEntry[] = Object.entries(
  scopeReferencesMap,
).map(([scopeType, referenceEntry]) => ({
  id: scopeType,
  kind: "scope",
  ...referenceEntry,
}));
