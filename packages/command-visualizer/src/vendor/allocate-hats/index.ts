/**
 * allocate-hats — standalone Cursorless hat allocation with a tokens-in
 * interface.
 *
 * You bring tokens (already tokenized however your substrate likes); this
 * package runs the REAL cursorless allocation algorithm (chooseTokenHat +
 * getHatRankingContext + HatMetrics + maxByFirstDiffering, vendored at SHA
 * 42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe) and returns hat assignments.
 *
 * Language support is upstream of allocation by design: languageId appears
 * nowhere in the allocator (verified across cursorless, prose-overlay,
 * Touchless, cursorless-css-state — brain-1uh8e §4). Tokenize with whatever
 * language machinery you have; allocation is language-blind.
 */

import {
  CompositeKeyMap,
  DefaultMap,
  HatStability,
  type HatCandidate,
  type HatStyleMap,
  type HatStyleName,
  Position,
  Range,
  type RankedToken,
  type Token,
  type TokenHat,
} from "./common";
import { chooseTokenHat } from "./vendor/chooseTokenHat";
import { getHatRankingContext } from "./vendor/getHatRankingContext";
import { rankTokensByProximity } from "./rank";
import { StandaloneGraphemeSplitter } from "./splitter";

export { HatStability } from "./common";
export type { HatStyleMap, HatStyleName } from "./common";
export { StandaloneGraphemeSplitter, deburr } from "./splitter";

// ---------------------------------------------------------------------------
// Public input/output types
// ---------------------------------------------------------------------------

export interface InputToken {
  /** The token's text. Graphemes are derived internally by the splitter. */
  text: string;
  /**
   * Optional explicit rank: HIGHER = more important = better hat. When every
   * token carries a rank, ranks are used as-is. When any token omits it, all
   * ranks are derived from cursor proximity instead (see
   * {@link AllocateHatsOptions.cursorIndex}).
   */
  rank?: number;
  /**
   * Optional document position for multi-line proximity ranking (touchless /
   * css-state style inputs). When omitted, the token sits at line 0,
   * character = its array index (the single-line prose model).
   */
  position?: { line: number; character: number };
}

export interface HatAssignment {
  /** Index into the input tokens array. */
  tokenIdx: number;
  /** Character offset of the hatted grapheme within the token text. */
  charIdx: number;
  /** The normalized grapheme the hat sits on. */
  grapheme: string;
  /** Full style name, e.g. "blue" or "blue-frame". */
  styleName: string;
}

export interface AllocateHatsOptions {
  tokens: InputToken[];
  /**
   * Hat assignments from the previous allocation — pass these back each
   * recompute to get hat stability (hats stay put as the buffer changes).
   */
  oldAssignments?: HatAssignment[];
  /** Keep/steal trade-off. Default: balanced (cursorless's default). */
  stability?: HatStability | "greedy" | "balanced" | "stable";
  /**
   * Enabled hat styles with penalties (lower penalty = preferred). Defaults
   * to {@link buildColorStyles} — 9 colors, no shapes.
   */
  enabledHatStyles?: HatStyleMap;
  /**
   * Used only when explicit per-token ranks are absent: tokens are ranked by
   * proximity to this gap index (0 = before first token, N = after last).
   * Defaults to tokens.length (end-biased), matching prose-overlay's
   * no-cursor behavior. Ignored when {@link cursorPosition} is set.
   */
  cursorIndex?: number;
  /**
   * Multi-line variant of {@link cursorIndex}: the reference position tokens
   * are ranked against (closest = best hat), for use with
   * {@link InputToken.position}. Ranking is |displayLine delta| then
   * |character delta| — cursorless's getTokenComparator, vendored.
   */
  cursorPosition?: { line: number; character: number };
}

// ---------------------------------------------------------------------------
// Default style maps (prose-overlay palette; matches cursorless's color set)
// ---------------------------------------------------------------------------

export const HAT_COLORS = [
  "gray",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
  "purple",
  "black",
  "white",
] as const;

export const HAT_COLOR_PENALTIES: Record<string, number> = {
  gray: 0,
  blue: 1,
  green: 1,
  red: 1,
  pink: 2,
  yellow: 2,
  purple: 2,
  black: 3,
  white: 3,
};

/**
 * Shape suffix vocabulary — mirrors cursorless HAT_NON_DEFAULT_SHAPES
 * (packages/common/src/types/command/legacy/targetDescriptorV2.types.ts).
 */
export const HAT_SHAPES = [
  "ex",
  "fox",
  "wing",
  "hole",
  "frame",
  "curve",
  "eye",
  "play",
  "bolt",
  "crosshairs",
] as const;

/** 9-entry color-only style map. */
export function buildColorStyles(): HatStyleMap {
  const out: HatStyleMap = {};
  for (const color of HAT_COLORS) {
    out[color] = { penalty: HAT_COLOR_PENALTIES[color] };
  }
  return out;
}

/**
 * Full 99-entry color x (no-shape + 10 shapes) map. Shape adds +1 to the
 * color's penalty, matching the upstream convention that each style
 * component contributes to total penalty.
 */
export function buildColorShapeStyles(): HatStyleMap {
  const out: HatStyleMap = {};
  for (const color of HAT_COLORS) {
    const colorPenalty = HAT_COLOR_PENALTIES[color];
    out[color] = { penalty: colorPenalty };
    for (const shape of HAT_SHAPES) {
      out[`${color}-${shape}`] = { penalty: colorPenalty + 1 };
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Internal: token construction + ranking
// ---------------------------------------------------------------------------

const FAKE_EDITOR = { id: "allocate-hats" };

function makeToken(input: InputToken, index: number): Token {
  const line = input.position?.line ?? 0;
  const character = input.position?.character ?? index;
  const start = new Position(line, character);
  const end = new Position(line, character + 1);
  return {
    editor: FAKE_EDITOR,
    text: input.text,
    // offsets.start doubles as the stable token identity (= input index);
    // range carries the (possibly caller-supplied) document position used
    // for proximity ranking.
    range: new Range(start, end),
    offsets: { start: index, end: index + 1 },
  };
}

/**
 * getTokenRemainingHatCandidates — copied from cursorless allocateHats.ts
 * (unexported upstream; same copy prose-overlay's proseStandalone.ts carries).
 */
function getTokenRemainingHatCandidates(
  splitter: StandaloneGraphemeSplitter,
  token: Token,
  graphemeRemainingHatCandidates: DefaultMap<string, HatStyleName[]>,
  enabledHatStyles: HatStyleMap,
): HatCandidate[] {
  const candidates: HatCandidate[] = [];
  const graphemes = splitter.getTokenGraphemes(token.text);
  for (const grapheme of graphemes) {
    for (const style of graphemeRemainingHatCandidates.get(grapheme.text)) {
      candidates.push({
        grapheme,
        style,
        penalty: enabledHatStyles[style]?.penalty ?? 99,
      });
    }
  }
  return candidates;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export function allocateHats(options: AllocateHatsOptions): HatAssignment[] {
  const {
    tokens,
    oldAssignments = [],
    stability = HatStability.balanced,
    enabledHatStyles = buildColorStyles(),
    cursorIndex,
    cursorPosition,
  } = options;

  const hatStability = stability as HatStability;
  const splitter = new StandaloneGraphemeSplitter();
  const enabledHatStyleNames = Object.keys(enabledHatStyles);

  const tokenObjects = tokens.map((t, i) => makeToken(t, i));

  // Ranking: explicit ranks when every token has one, else proximity to the
  // reference position (cursorPosition, or gap cursorIndex on line 0 —
  // defaulting to end-biased, matching prose-overlay's no-cursor behavior).
  const allRanked = tokens.every((t) => typeof t.rank === "number");
  const referencePosition = cursorPosition
    ? new Position(cursorPosition.line, cursorPosition.character)
    : new Position(0, cursorIndex ?? tokens.length);
  const rankedTokens: RankedToken[] = allRanked
    ? tokens.map((t, i) => ({ token: tokenObjects[i], rank: t.rank! }))
    : rankTokensByProximity(tokenObjects, referencePosition);

  // Old hat map for stability.
  const tokenOldHatMap = new CompositeKeyMap<Token, TokenHat>(
    ({ editor, offsets }) => [editor.id, offsets.start, offsets.end],
  );
  for (const { tokenIdx, grapheme, styleName } of oldAssignments) {
    if (tokenIdx >= 0 && tokenIdx < tokens.length) {
      const token = tokenObjects[tokenIdx];
      tokenOldHatMap.set(token, {
        hatStyle: styleName,
        grapheme,
        token,
        hatRange: token.range,
      });
    }
  }

  const context = getHatRankingContext(rankedTokens, tokenOldHatMap, splitter);

  const graphemeRemainingHatCandidates = new DefaultMap<string, HatStyleName[]>(
    () => [...enabledHatStyleNames],
  );

  // Process tokens in descending rank order (best tokens first).
  const sortedRanked = [...rankedTokens].sort((a, b) => b.rank - a.rank);
  const result: HatAssignment[] = [];

  for (const { token, rank } of sortedRanked) {
    const candidates = getTokenRemainingHatCandidates(
      splitter,
      token,
      graphemeRemainingHatCandidates,
      enabledHatStyles,
    );

    const chosen = chooseTokenHat(
      context,
      hatStability,
      rank,
      tokenOldHatMap.get(token),
      candidates,
    );

    if (chosen == null) {
      continue;
    }

    // Remove the chosen hat from candidates for lower-ranked tokens.
    graphemeRemainingHatCandidates.set(
      chosen.grapheme.text,
      graphemeRemainingHatCandidates
        .get(chosen.grapheme.text)
        .filter((s) => s !== chosen.style),
    );

    result.push({
      tokenIdx: token.offsets.start,
      charIdx: chosen.grapheme.tokenStartOffset,
      grapheme: chosen.grapheme.text,
      styleName: String(chosen.style),
    });
  }

  result.sort((a, b) => a.tokenIdx - b.tokenIdx);
  return result;
}
