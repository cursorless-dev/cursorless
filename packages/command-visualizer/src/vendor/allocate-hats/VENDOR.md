# Vendored: allocate-hats

Internalized copy of the `allocate-hats` package's `src/` tree.

- **Source repo:** github.com/trillium/allocate-hats
- **Vendored commit / SHA:** `42452eb` (recorded in the source headers; this is
  also the cursorless SHA `42452eba521bb9cccbb3e04a2cd9e9afcf6cbffe` whose
  `allocateHats` subgraph these files vendor, proven byte-identical to the
  shipped prose-overlay bundle).
- **Why internalized:** `allocate-hats@0.1.0` is unpublished (npm has no such
  package; it lived only at `~/code/allocate-hats`). Vendoring lets
  `@cursorless/command-visualizer` compile in-monorepo with zero external deps.

## What is imported from source vs. kept pinned vs. dropped

**Imported from `@cursorless/lib-common` / `@cursorless/lib-engine` (no clone):**

- `CompositeKeyMap`, `DefaultMap` — re-exported through `common/index.ts` from
  `@cursorless/lib-common` (byte-identical to the copies that used to live in
  `common/`). The local files were deleted.
- `GRAPHEME_SPLIT_REGEX` — imported from `@cursorless/lib-engine` in
  `splitter.ts` (and, in the package proper, in `tokenize.ts` / `columns.ts`).
- `maxByFirstDiffering` — imported from `@cursorless/lib-engine` in
  `vendor/chooseTokenHat.ts` (byte-identical to the pin; generic, no cursorless
  types in its signature). The local `vendor/maxByFirstDiffering.ts` was deleted.

**Kept PINNED at SHA `42452eb` (must NOT be swapped for the current lib-engine
versions — upstream has diverged, see per-file headers for the exact reason):**

- `vendor/chooseTokenHat.ts` — current upstream added a `forcedTokenHat` param
  (#2602) and an `avoidFirstLetter` step (#1723).
- `vendor/HatMetrics.ts` — current upstream added `avoidFirstLetter`, needing
  `HatCandidate.isFirstLetter` (a WordTokenizer/IDE-derived field this offline
  renderer cannot compute).
- `vendor/getHatRankingContext.ts` — current upstream types against the concrete
  IDE-backed `TokenGraphemeSplitter` and full engine `Token`; this copy accepts
  the structural `GraphemeSplitter` + simplified Token.
- `vendor/getTokenComparator.ts` — byte-identical to source, but the engine
  version's signature is typed against lib-common's full `Token`, which the
  simplified standalone Token is not assignable to.
- `common/types.ts` — custom minimal `Position`/`Range`/`Token`/`HatCandidate`/
  `RankedToken`/`Grapheme`/`GraphemeSplitter` (no public lib-common equivalents
  for the last four; `Position`/`Range`/`Token` deliberately simplified).
- `index.ts` (the tokens-in `allocateHats` wrapper), `rank.ts`,
  `splitter.ts` (the `StandaloneGraphemeSplitter` class + inline `deburr`) —
  genuinely-new glue with no cursorless equivalent (the engine paths require a
  live IDE / TextEditor).

Dropped during the original vendoring (unused by this package):

- `bundle.ts` — QuickJS IIFE entry (exposes API on `globalThis`).
- `proseCompat.ts` — prose-overlay legacy JSON-in/JSON-out compatibility API.

## Consumer

`src/hat-allocator.ts` imports `allocateHats`, `StandaloneGraphemeSplitter`,
and the `HatStyleMap` type from `./vendor/allocate-hats/index`.

## Updating

The pinned files must stay at SHA `42452eb` to preserve the renderer's
byte-for-byte fidelity to the recorded prose-overlay bundle. Do NOT
mechanically re-sync them to current cursorless — that would pull in
`forcedTokenHat` / `avoidFirstLetter` and change hat placement. If you
deliberately want the new algorithm, that is a behavior change to design and
verify against the fixture oracle, not a copy-paste refresh.

The imported-from-source pieces (`CompositeKeyMap`, `DefaultMap`,
`GRAPHEME_SPLIT_REGEX`, `maxByFirstDiffering`) track cursorless automatically
via the workspace deps — nothing to re-copy.
