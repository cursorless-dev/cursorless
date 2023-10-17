import { mapValues } from "lodash";
import {
  PartialSpokenFormTypes,
  SpokenFormMap,
  SpokenFormMapEntry,
  SpokenFormMapKeyTypes,
} from "./SpokenFormMap";

type DefaultSpokenFormMapDefinition = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Readonly<
    Record<SpokenFormMapKeyTypes[K], string | DefaultSpokenFormMapEntry>
  >;
};

const defaultSpokenFormMapCore: DefaultSpokenFormMapDefinition = {
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
    word: "word",
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
    switchStatementSubject: isPrivate("subject"),
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
  },

  customRegex: {},
};

function disabledByDefault(
  ...spokenForms: string[]
): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: false,
  };
}

function secret(...spokenForms: string[]): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: true,
  };
}

export interface DefaultSpokenFormMapEntry {
  defaultSpokenForms: string[];
  isDisabledByDefault: boolean;
  isSecret: boolean;
}

export type DefaultSpokenFormMap = {
  readonly [K in keyof SpokenFormMapKeyTypes]: K extends PartialSpokenFormTypes
    ? Readonly<
        Partial<Record<SpokenFormMapKeyTypes[K], DefaultSpokenFormMapEntry>>
      >
    : Record<SpokenFormMapKeyTypes[K], DefaultSpokenFormMapEntry>;
};

// FIXME: Don't cast here; need to make our own mapValues with stronger typing
// using tricks from our object.d.ts
export const defaultSpokenFormInfo = mapValues(
  defaultSpokenFormMapCore,
  (entry) =>
    mapValues(entry, (subEntry) =>
      typeof subEntry === "string"
        ? {
            defaultSpokenForms: [subEntry],
            isDisabledByDefault: false,
            isPrivate: false,
          }
        : subEntry,
    ),
) as DefaultSpokenFormMap;

// FIXME: Don't cast here; need to make our own mapValues with stronger typing
// using tricks from our object.d.ts
export const defaultSpokenFormMap = mapValues(defaultSpokenFormInfo, (entry) =>
  mapValues(
    entry,
    ({
      defaultSpokenForms,
      isDisabledByDefault,
      isSecret,
    }): SpokenFormMapEntry => ({
      spokenForms: isDisabledByDefault ? [] : defaultSpokenForms,
      isCustom: false,
      defaultSpokenForms,
      requiresTalonUpdate: false,
      isSecret,
    }),
  ),
) as SpokenFormMap;
