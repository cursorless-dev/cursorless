export { allocateHats } from "./allocateHats";
export type { HatCandidate } from "./allocateHats";

// Individual hat-allocation primitives, exported so downstream consumers (e.g.
// @cursorless/command-visualizer) can reuse the real ranking/selection
// building blocks instead of vendoring copies of them.
export { chooseTokenHat } from "./chooseTokenHat";
export { getHatRankingContext } from "./getHatRankingContext";
export type { RankingContext } from "./getHatRankingContext";
export { getRankedTokens } from "./getRankedTokens";
export type { RankedToken } from "./getRankedTokens";
export { getTokenComparator } from "./getTokenComparator";
export { maxByFirstDiffering, maxByAllowingTies } from "./maxByFirstDiffering";
export type { HatMetric } from "./HatMetrics";
export {
  avoidFirstLetter,
  hatOldTokenRank,
  isOldTokenHat,
  minimumTokenRankContainingGrapheme,
  negativePenalty,
  penaltyEquivalenceClass,
} from "./HatMetrics";
