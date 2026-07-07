/**
 * Minimal type surface extracted from @cursorless/common at cursorless SHA
 * 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe (the pinned SHA all three delivery
 * substrates already build against).
 *
 * Position and Range are deliberately SIMPLIFIED: the allocation path only
 * ever constructs them and reads `.line` / `.character` / `.start` / `.end`.
 * Upstream's method surface (isEqual, union, toSelection, ...) is unused by
 * the allocator and omitted. Token / TokenHat / HatStyleMap match upstream
 * shapes field-for-field.
 */

export class Position {
  constructor(
    public readonly line: number,
    public readonly character: number,
  ) {}
}

export class Range {
  readonly start: Position;
  readonly end: Position;

  constructor(start: Position, end: Position) {
    this.start = start;
    this.end = end;
  }
}

export interface RangeOffsets {
  start: number;
  end: number;
}

/**
 * The allocator never dereferences the editor beyond `id` (used as part of
 * the CompositeKeyMap token identity key).
 */
export interface MinimalEditor {
  id: string;
}

/** Mirrors @cursorless/common types/Token.ts */
export interface Token {
  editor: MinimalEditor;
  range: Range;
  offsets: RangeOffsets;
  text: string;
}

export type HatStyleName = string;

/** Mirrors @cursorless/common types/HatTokenMap.ts TokenHat */
export interface TokenHat {
  hatStyle: HatStyleName;
  grapheme: string;
  token: Token;
  hatRange: Range;
}

export type HatStyleMap = Record<HatStyleName, { penalty: number }>;

/**
 * Mirrors @cursorless/common ide/types/HatStability.ts — string enum values
 * are load-bearing (callers pass the raw strings across JSON boundaries).
 */
export enum HatStability {
  greedy = "greedy",
  balanced = "balanced",
  stable = "stable",
}

/** Mirrors the grapheme shape produced by cursorless's TokenGraphemeSplitter */
export interface Grapheme {
  text: string;
  tokenStartOffset: number;
  tokenEndOffset: number;
}

/**
 * Structural stand-in for cursorless's TokenGraphemeSplitter — the ranking
 * context only calls `getTokenGraphemes`.
 */
export interface GraphemeSplitter {
  getTokenGraphemes(tokenText: string): Grapheme[];
}

/**
 * Mirrors HatCandidate from cursorless-engine util/allocateHats/allocateHats.ts
 */
export interface HatCandidate {
  grapheme: Grapheme;
  style: HatStyleName;
  penalty: number;
}

/** Mirrors RankedToken from util/allocateHats/getRankedTokens.ts */
export interface RankedToken {
  token: Token;
  /**
   * Higher rank = more likely to be used = gets a better hat. Upstream uses
   * rank = -sortedIndex (0 is best, increasingly negative is worse).
   */
  rank: number;
}
