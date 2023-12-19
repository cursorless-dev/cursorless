import { DefaultSpokenFormMapDefinition } from "./defaultSpokenFormMap.types";
import { isDisabledByDefault, isPrivate } from "./spokenFormMapUtil";

/**
 * This map contains the default spoken forms for all our speakable entities,
 * including scope types, paired delimiters, etc. We would like this map to
 * become the sole source of truth for our default spoken forms, including the
 * Talon side. Today it is only used on the extension side for testing, and as a
 * fallback when we can't get the custom spoken forms from Talon.
 *
 * In this map, for regular entities, ie ones that are speakable by default, not
 * private, and have only one spoken form, we allow a shorthand of just providing
 * the spoken form as a string. For more complex cases, we can use the
 * {@link isPrivate} or {@link isDisabledByDefault} helper functions to construct
 * {@link DefaultSpokenFormMapEntry} objects, or just construct them manually.
 */
export const defaultSpokenFormMapCore: DefaultSpokenFormMapDefinition = {
  pairedDelimiter: {
    curlyBrackets: "curly",
    angleBrackets: "diamond",
    escapedDoubleQuotes: "escaped quad",
    escapedSingleQuotes: "escaped twin",
    escapedParentheses: "escaped round",
    escapedSquareBrackets: "escaped box",
    doubleQuotes: "quad",
    parentheses: "round",
    backtickQuotes: "skis",
    squareBrackets: "box",
    singleQuotes: "twin",
    any: "pair",
    string: "string",
    whitespace: "void",

    collectionBoundary: isPrivate("collection boundary"),
  },

  simpleScopeTypeType: {
    argumentOrParameter: "arg",
    attribute: "attribute",
    functionCall: "call",
    functionCallee: "callee",
    className: "class name",
    class: "class",
    comment: "comment",
    functionName: "funk name",
    namedFunction: "funk",
    ifStatement: "if state",
    instance: "instance",
    collectionItem: "item",
    collectionKey: "key",
    anonymousFunction: "lambda",
    list: "list",
    map: "map",
    name: "name",
    regularExpression: "regex",
    section: "section",
    sectionLevelOne: isDisabledByDefault("one section"),
    sectionLevelTwo: isDisabledByDefault("two section"),
    sectionLevelThree: isDisabledByDefault("three section"),
    sectionLevelFour: isDisabledByDefault("four section"),
    sectionLevelFive: isDisabledByDefault("five section"),
    sectionLevelSix: isDisabledByDefault("six section"),
    selector: "selector",
    statement: "state",
    branch: "branch",
    type: "type",
    value: "value",
    condition: "condition",
    unit: "unit",
    //  XML, JSX
    xmlElement: "element",
    xmlBothTags: "tags",
    xmlStartTag: "start tag",
    xmlEndTag: "end tag",
    // LaTeX
    part: "part",
    chapter: "chapter",
    subSection: "subsection",
    subSubSection: "subsubsection",
    namedParagraph: "paragraph",
    subParagraph: "subparagraph",
    environment: "environment",
    // Talon
    command: "command",
    // Text-based scope types
    character: "char",
    word: "sub",
    token: "token",
    identifier: "identifier",
    line: "line",
    sentence: "sentence",
    paragraph: "block",
    document: "file",
    nonWhitespaceSequence: "paint",
    boundedNonWhitespaceSequence: "short paint",
    url: "link",
    notebookCell: "cell",

    ["private.fieldAccess"]: isPrivate("access"),
    string: isPrivate("parse tree string"),
    ["private.switchStatementSubject"]: isPrivate("subject"),
  },
  complexScopeTypeType: {
    glyph: "glyph",
  },

  surroundingPairForceDirection: {
    left: "left",
    right: "right",
  },

  simpleModifier: {
    excludeInterior: "bounds",
    toRawSelection: "just",
    leading: "leading",
    trailing: "trailing",
    keepContentFilter: "content",
    keepEmptyFilter: "empty",
    inferPreviousMark: "its",
    startOf: "start of",
    endOf: "end of",
    interiorOnly: "inside",
    visible: "visible",
    extendThroughStartOf: "head",
    extendThroughEndOf: "tail",
    everyScope: "every",
  },

  modifierExtra: {
    first: "first",
    last: "last",
    previous: "previous",
    next: "next",
    forward: "forward",
    backward: "backward",
    ancestor: "grand",
  },

  customRegex: {},
};
