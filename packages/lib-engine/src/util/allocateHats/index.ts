export { allocateHats } from "./allocateHats";

// maxByFirstDiffering is the only primitive from this sub-tree imported by
// @cursorless/command-visualizer (vendored chooseTokenHat.ts, SHA 42452eb).
// The broader ranking/selection helpers (chooseTokenHat, getHatRankingContext,
// HatMetrics, etc.) have drifted in signature since that SHA and must stay
// vendored there; they are NOT re-exported here to keep the public surface
// minimal and prevent callers from taking a dependency on unstable internals.
export { maxByFirstDiffering } from "./maxByFirstDiffering";
