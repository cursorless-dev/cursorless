import { mapValues } from "lodash";
import {
  SpokenFormMap,
  SpokenFormMapEntry,
  SpokenFormMapKeyTypes,
  SpokenFormMappingType,
  mapSpokenForms,
} from "./SpokenFormMap";

type DefaultSpokenFormMapDefinition = {
  readonly [K in keyof SpokenFormMapKeyTypes]: Readonly<
    Record<SpokenFormMapKeyTypes[K], string | DefaultSpokenFormMapEntry>
  >;
};

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

/**
 * Used to construct entities that should not be speakable by default.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A DefaultSpokenFormMapEntry with the given spoken forms, and
 * {@link DefaultSpokenFormMapEntry.isDisabledByDefault|isDisabledByDefault} set
 * to true
 */
function isDisabledByDefault(
  ...spokenForms: string[]
): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: false,
  };
}

/**
 * Used to construct entities that are only for internal experimentation.
 *
 * @param spokenForms The default spoken forms for this entity
 * @returns A DefaultSpokenFormMapEntry with the given spoken forms, and
 * {@link DefaultSpokenFormMapEntry.isDisabledByDefault|isDisabledByDefault} and
 * {@link DefaultSpokenFormMapEntry.isPrivate|isPrivate} set to true
 */
function isPrivate(...spokenForms: string[]): DefaultSpokenFormMapEntry {
  return {
    defaultSpokenForms: spokenForms,
    isDisabledByDefault: true,
    isPrivate: true,
  };
}

export interface DefaultSpokenFormMapEntry {
  defaultSpokenForms: string[];

  /**
   * If `true`, indicates that the entry may have a default spoken form, but
   * it should not be enabled by default. These will show up in user csv's with
   * a `-` at the beginning.
   */
  isDisabledByDefault: boolean;

  /**
   * If `true`, indicates that the entry is only for internal experimentation,
   * and should not be exposed to users except within a targeted working group.
   */
  isPrivate: boolean;
}

export type DefaultSpokenFormMap =
  SpokenFormMappingType<DefaultSpokenFormMapEntry>;

/**
 * This map contains information about the default spoken forms for all our
 * speakable entities, including scope types, paired delimiters, etc. Note that
 * this map can't be used as a spoken form map. If you want something that can
 * be used as a spoken form map, see {@link defaultSpokenFormMap}.
 */
export const defaultSpokenFormInfo: DefaultSpokenFormMap = mapSpokenForms(
  defaultSpokenFormMapCore,
  (subEntry) =>
    typeof subEntry === "string"
      ? {
          defaultSpokenForms: [subEntry],
          isDisabledByDefault: false,
          isPrivate: false,
        }
      : subEntry,
);

/**
 * A spoken form map constructed from the default spoken forms. It is designed to
 * be used as a fallback when the Talon spoken form map is not available.
 */
export const defaultSpokenFormMap = mapValues(
  defaultSpokenFormInfo,
  (entry) =>
    mapValues(
      entry,
      ({
        defaultSpokenForms,
        isDisabledByDefault,
        isPrivate,
      }): SpokenFormMapEntry => ({
        spokenForms: isDisabledByDefault ? [] : defaultSpokenForms,
        isCustom: false,
        defaultSpokenForms,
        requiresTalonUpdate: false,
        isPrivate,
      }),
    ),
  // FIXME: Don't cast here; need to make our own mapValues with stronger typing
  // using tricks from our object.d.ts
) as SpokenFormMap;
