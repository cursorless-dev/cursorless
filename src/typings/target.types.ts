import { Range, Selection, TextEditor } from "vscode";
import { HatStyleName } from "../core/constants";

export interface CursorMark {
  type: "cursor";
}

export interface ThatMark {
  type: "that";
}

export interface SourceMark {
  type: "source";
}

export interface NothingMark {
  type: "nothing";
}

export interface LastCursorPositionMark {
  type: "lastCursorPosition";
}

export interface DecoratedSymbolMark {
  type: "decoratedSymbol";
  symbolColor: HatStyleName;
  character: string;
}

export type LineNumberType = "absolute" | "relative" | "modulo100";

export interface LineNumberPosition {
  type: LineNumberType;
  lineNumber: number;
}

export interface LineNumberMark {
  type: "lineNumber";
  anchor: LineNumberPosition;
  active: LineNumberPosition;
}

export type Mark =
  | CursorMark
  | ThatMark
  | SourceMark
  //   | LastCursorPositionMark Not implemented yet
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark;

export type SimpleSurroundingPairName =
  | "angleBrackets"
  | "backtickQuotes"
  | "curlyBrackets"
  | "doubleQuotes"
  | "escapedDoubleQuotes"
  | "escapedParentheses"
  | "escapedSquareBrackets"
  | "escapedSingleQuotes"
  | "parentheses"
  | "singleQuotes"
  | "squareBrackets";
export type ComplexSurroundingPairName = "string" | "any";
export type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

export type ScopeType =
  | "argumentOrParameter"
  | "anonymousFunction"
  | "attribute"
  | "class"
  | "className"
  | "collectionItem"
  | "collectionKey"
  | "comment"
  | "functionCall"
  | "functionName"
  | "ifStatement"
  | "list"
  | "map"
  | "name"
  | "namedFunction"
  | "regularExpression"
  | "statement"
  | "string"
  | "type"
  | "value"
  | "condition"
  | "section"
  | "sectionLevelOne"
  | "sectionLevelTwo"
  | "sectionLevelThree"
  | "sectionLevelFour"
  | "sectionLevelFive"
  | "sectionLevelSix"
  | "selector"
  | "xmlBothTags"
  | "xmlElement"
  | "xmlEndTag"
  | "xmlStartTag"
  // Text based scopes
  //   | "character" Not implemented
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "nonWhitespaceSequence"
  | "url";

export type SubTokenType = "word" | "character";

export type SurroundingPairDirection = "left" | "right";
export interface SurroundingPairModifier {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  forceDirection?: SurroundingPairDirection;
}

export interface InteriorOnlyModifier {
  type: "interiorOnly";
}

export interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
}

export interface EveryScopeModifier {
  type: "everyScope";
  scopeType: ScopeType;
}

export interface SubTokenModifier {
  type: "subpiece";
  pieceType: SubTokenType;
  anchor: number;
  active: number;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */
export interface RawSelectionModifier {
  type: "toRawSelection";
}

export interface HeadModifier {
  type: "head";
}

export interface TailModifier {
  type: "tail";
}

export type Position = "before" | "after" | "start" | "end";

export interface PositionModifier {
  type: "position";
  position: Position;
}

export interface PartialPrimitiveTargetDesc {
  type: "primitive";
  mark?: Mark;
  modifiers?: Modifier[];
  isImplicit?: boolean;
}

export type Modifier =
  | PositionModifier
  | SurroundingPairModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | SubTokenModifier
  | HeadModifier
  | TailModifier
  | RawSelectionModifier;

export interface PartialRangeTargetDesc {
  type: "range";
  anchor: PartialPrimitiveTargetDesc;
  active: PartialPrimitiveTargetDesc;
  excludeStart?: boolean;
  excludeEnd?: boolean;
  rangeType?: RangeType;
}

export interface PartialListTargetDesc {
  type: "list";
  elements: (PartialPrimitiveTargetDesc | PartialRangeTargetDesc)[];
}

export type PartialTargetDesc =
  | PartialPrimitiveTargetDesc
  | PartialRangeTargetDesc
  | PartialListTargetDesc;

export interface PrimitiveTargetDescriptor extends PartialPrimitiveTargetDesc {
  mark: Mark;
  modifiers: Modifier[];
}

export interface RangeTargetDescriptor {
  type: "range";
  anchor: PrimitiveTargetDescriptor;
  active: PrimitiveTargetDescriptor;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType: RangeType;
}

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets
export type RangeType = "continuous" | "vertical";

export interface ListTargetDescriptor {
  type: "list";
  elements: (PrimitiveTargetDescriptor | RangeTargetDescriptor)[];
}

export type TargetDescriptor =
  | PrimitiveTargetDescriptor
  | RangeTargetDescriptor
  | ListTargetDescriptor;

export interface RemovalRange {
  /** The range to be removed  */
  range: Range;
  /** Optional highlight range to be used for highlight instead of the removal range  */
  highlight?: Range;
  /** If true this range is excluded from delimiters by default  */
  exclude?: boolean;
}

export type EditNewLineContext = { command: string } | { delimiter: string };

export interface TargetParameters {
  /** The text editor used for all ranges */
  editor: TextEditor;

  /** If true active is before anchor */
  isReversed: boolean;

  /** Is this a scope type other raw selection? */
  scopeType?: ScopeType;

  /** The current position */
  position?: Position;

  /**
   * If this selection has a delimiter. For example, new line for a line or paragraph and comma for a list or argument
   */
  delimiter?: string;

  /** The range of the content */
  contentRange: Range;

  /** The range to remove the content */
  removalRange?: Range;

  /**
   * Represents the interior range of this selection. For example, for a
   * surrounding pair this would exclude the opening and closing delimiter. For an if
   * statement this would be the statements in the body.
   */
  interiorRange?: Range;

  /**
   * Represents the boundary ranges of this selection. For example, for a
   * surrounding pair this would be the opening and closing delimiter. For an if
   * statement this would be the line of the guard as well as the closing brace.
   */
  boundary?: [Range, Range];

  /** The range of the delimiter before the content selection */
  leadingDelimiter?: RemovalRange;

  /** The range of the delimiter after the content selection */
  trailingDelimiter?: RemovalRange;
}

export interface Target extends TargetParameters {
  /** If true this target should be treated as a line in regards to continuous range */
  isLine?: boolean;

  getContentSelection(): Selection;
  getContentText(): string;
  maybeAddDelimiter(text: string): string;
  getRemovalRange(): Range;
  getRemovalHighlightRange(): Range | undefined;
  getEditNewLineContext(isBefore: boolean): EditNewLineContext;
}
