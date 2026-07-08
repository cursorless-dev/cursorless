export { allocateHats } from "./allocateHats";

// getTokensInRange is the real cursorless tokenizer-backed token extractor.
// @cursorless/command-visualizer needs it to discover the exact engine token
// (and its whole-token document offsets) covering a fixture mark, so it can
// build a `forceTokenHats` entry whose token identity matches what the engine
// produces internally — pinning fixture marks to their recorded color.
// EXPORT-ONLY: no behavior change; it is called with the same (ide, editor,
// range) contract the engine uses in getRankedTokens.
export { getTokensInRange } from "./getTokensInRange";

// maxByFirstDiffering is the only primitive from this sub-tree imported by
// @cursorless/command-visualizer (vendored chooseTokenHat.ts, SHA 42452eb).
// The broader ranking/selection helpers (chooseTokenHat, getHatRankingContext,
// HatMetrics, etc.) have drifted in signature since that SHA and must stay
// vendored there; they are NOT re-exported here to keep the public surface
// minimal and prevent callers from taking a dependency on unstable internals.
export { maxByFirstDiffering } from "./maxByFirstDiffering";
