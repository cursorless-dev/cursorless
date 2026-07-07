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

## What was copied vs. dropped

Copied verbatim (the allocation core our package actually uses):

- `index.ts` — public entry (`allocateHats`, `StandaloneGraphemeSplitter`,
  `HatStyleMap`, style-map builders).
- `rank.ts`, `splitter.ts`
- `common/` — `types.ts`, `index.ts`, `CompositeKeyMap.ts`, `DefaultMap.ts`
- `vendor/` — `chooseTokenHat.ts`, `getHatRankingContext.ts`,
  `getTokenComparator.ts`, `HatMetrics.ts`, `maxByFirstDiffering.ts`

Dropped during vendoring (unused by this package — grep-confirmed no importers
in `src/`, and nothing inside the vendored tree imports them):

- `bundle.ts` — QuickJS IIFE entry (exposes API on `globalThis`).
- `proseCompat.ts` — prose-overlay legacy JSON-in/JSON-out compatibility API.

## Consumer

`src/hat-allocator.ts` imports `allocateHats`, `StandaloneGraphemeSplitter`,
and the `HatStyleMap` type from `./vendor/allocate-hats/index`.

## Updating

Re-copy `~/code/allocate-hats/src/`, then re-drop `bundle.ts` and
`proseCompat.ts`, and bump the SHA above.
