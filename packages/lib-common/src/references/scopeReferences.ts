import type { ScopeTypeType } from "../types/command/PartialTargetDescriptor.types";
import {
  EVERY,
  ITEM,
  LINE,
  SET_SELECTION,
  STATEMENT,
  VAR_CHARACTER,
  VAR_PAIR,
  VAR_SPOKEN_FORM,
} from "./constants";
import { pairedDelimiterReferences } from "./pairedDelimiterReferences";
import type { ReferenceEntry } from "./ReferenceEntry";
import { connectiveDefaultSpokenForms } from "./spokenForms/connectiveDefaultSpokenForms";
import { graphemeDefaultSpokenForms } from "./spokenForms/graphemeDefaultSpokenForms";

const DEFAULT_PATTERN = VAR_SPOKEN_FORM;

const AIR = graphemeDefaultSpokenForms.a;
const TARGET = `blue ${AIR}`;
const TARGET_DESC = "token containing letter 'a' with a blue hat";
const PARENTHESIS = pairedDelimiterReferences.parentheses.defaultSpokenForm;
const NEXT = connectiveDefaultSpokenForms.next;

export const scopeReferences: Record<ScopeTypeType, ReferenceEntry> = {
  argumentOrParameter: {
    name: "Argument or parameter",
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
  attribute: {
    name: "Attribute",
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
  branch: {
    name: "Branch",
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
  class: {
    name: "Class",
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
  collectionItem: {
    name: "Collection item",
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
  comment: {
    name: "Comment",
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
  functionCall: {
    name: "Function call",
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
  functionName: {
    name: "Function name",
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
  ifStatement: {
    name: "If statement",
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
  instance: {
    name: "Instance",
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
  list: {
    name: "List",
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
  name: {
    name: "Name",
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
  namedFunction: {
    name: "Named function",
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
  regularExpression: {
    name: "Regular expression",
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
  statement: {
    name: "Statement",
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
  type: {
    name: "Type",
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
  condition: {
    name: "Condition",
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
  section: {
    name: "Section",
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
  selector: {
    name: "Selector",
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
  xmlBothTags: {
    name: "XML both tags",
    defaultSpokenForm: "tags",
    syntaxes: [
      {
        pattern: DEFAULT_PATTERN,
        description: "XML both tags.",
        cheatsheet: "XML both tags",
      },
    ],
    examples: [
      {
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the xml both tags containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlElement: {
    name: "XML element",
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
        description: `Selects the xml element containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlEndTag: {
    name: "XML end tag",
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
        description: `Selects the xml end tag containing the ${TARGET_DESC}.`,
      },
    ],
  },
  xmlStartTag: {
    name: "XML start tag",
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
        description: `Selects the xml start tag containing the ${TARGET_DESC}.`,
      },
    ],
  },
  part: {
    name: "Part",
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
  character: {
    name: "Character",
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
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the character containing the ${TARGET_DESC}.`,
      },
    ],
  },
  word: {
    name: "Sub token word",
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
        command: `${SET_SELECTION} ${VAR_SPOKEN_FORM} ${TARGET}`,
        description: `Selects the sub token word containing the ${TARGET_DESC}.`,
      },
    ],
  },
  token: {
    name: "Token",
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
        description: `Selects the token containing the ${TARGET_DESC}.`,
      },
    ],
  },
  identifier: {
    name: "Identifier",
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
  line: {
    name: "Line",
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
  nonWhitespaceSequence: {
    name: "Non-whitespace sequence",
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
    nameShort: "Bounded non-ws sequence",
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
  notebookCell: {
    name: "Notebook cell",
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
  command: {
    name: "Command",
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
  glyph: {
    name: "Glyph",
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
  surroundingPair: {
    name: "Surrounding pair",
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

  // Private scopes --------------------

  "private.fieldAccess": {
    name: "Field access",
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
    private: true,
    syntaxes: [],
    examples: [],
  },
  customRegex: {
    name: "Custom regex",
    private: true,
    syntaxes: [],
    examples: [],
  },
} as const;
