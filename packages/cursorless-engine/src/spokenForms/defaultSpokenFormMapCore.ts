import type { DefaultSpokenFormMapDefinition } from "./defaultSpokenFormMap.types";
import { graphemeDefaultSpokenForms } from "./graphemes";
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
    tripleDoubleQuotes: isPrivate("triple quad"),
    tripleSingleQuotes: isPrivate("triple twin"),
    tripleBacktickQuotes: isPrivate("triple skis"),
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
    boundedParagraph: "short block",
    document: "file",
    nonWhitespaceSequence: "paint",
    boundedNonWhitespaceSequence: "short paint",
    url: "link",
    notebookCell: "cell",

    string: isPrivate("parse tree string"),
    textFragment: isPrivate("text fragment"),
    disqualifyDelimiter: isPrivate("disqualify delimiter"),
    pairDelimiter: isPrivate("pair delimiter"),
    ["private.fieldAccess"]: isPrivate("access"),
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
  action: {
    addSelection: "append",
    addSelectionAfter: "append post",
    addSelectionBefore: "append pre",
    breakLine: "break",
    scrollToBottom: "bottom",
    toggleLineBreakpoint: "break point",
    cutToClipboard: "carve",
    scrollToCenter: "center",
    clearAndSetSelection: "change",
    remove: "chuck",
    insertCopyBefore: "clone up",
    insertCopyAfter: "clone",
    toggleLineComment: "comment",
    copyToClipboard: "copy",
    scrollToTop: "crown",
    outdentLine: "dedent",
    revealDefinition: "define",
    editNewLineBefore: "drink",
    insertEmptyLineBefore: "drop",
    extractVariable: "extract",
    insertEmptyLineAfter: "float",
    foldRegion: "fold",
    followLink: "follow",
    followLinkAside: "follow split",
    deselect: "give",
    highlight: "highlight",
    showHover: "hover",
    increment: "increment",
    decrement: "decrement",
    indentLine: "indent",
    showDebugHover: "inspect",
    setSelectionAfter: "post",
    editNewLineAfter: "pour",
    setSelectionBefore: "pre",
    insertEmptyLinesAround: "puff",
    showQuickFix: "quick fix",
    showReferences: "reference",
    rename: "rename",
    reverseTargets: "reverse",
    findInDocument: "scout",
    findInWorkspace: "scout all",
    randomizeTargets: "shuffle",
    generateSnippet: "snippet make",
    sortTargets: "sort",
    setSelection: "take",
    revealTypeDefinition: "type deaf",
    unfoldRegion: "unfold",
    callAsFunction: "call",
    swapTargets: "swap",
    replaceWithTarget: "bring",
    moveToTarget: "move",
    wrapWithPairedDelimiter: "wrap",
    wrapWithSnippet: "wrap",
    rewrapWithPairedDelimiter: "repack",
    insertSnippet: "snippet",
    pasteFromClipboard: "paste",
    joinLines: "join",

    ["private.showParseTree"]: isPrivate("parse tree"),
    ["experimental.setInstanceReference"]: isDisabledByDefault("from"),

    editNew: isPrivate("edit new"),
    executeCommand: isPrivate("execute command"),
    parsed: isPrivate("parsed"),
    getText: isPrivate("get text"),
    replace: isPrivate("replace"),
    ["private.getTargets"]: isPrivate("get targets"),
    ["private.setKeyboardTarget"]: isPrivate("set keyboard target"),

    // These actions are implemented talon-side, usually using `getText` followed
    // by some other action.
    // applyFormatter: "format",
    // nextHomophone: "phones",
  },
  customAction: {},
  grapheme: graphemeDefaultSpokenForms,
};
