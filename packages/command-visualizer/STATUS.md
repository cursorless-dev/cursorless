# Integration status

This package renders cursorless command fixtures as animated SVGs. It has been
reworked to deduplicate against cursorless's public API and to compile
in-monorepo. Everything below touches ONLY `packages/command-visualizer/`.

## Done

1. **allocate-hats internalized** (step 1). The unpublished `allocate-hats@0.1.0`
   npm dependency (it lived only at `~/code/allocate-hats`, never on npm) is
   gone. Its `src/` tree is vendored verbatim under
   `src/vendor/allocate-hats/` (cursorless SHA `42452eb`); `hat-allocator.ts`
   imports from `./vendor/allocate-hats/index`. The unused QuickJS entry points
   (`bundle.ts`, `proseCompat.ts`) were dropped. The vendored tree
   self-typechecks clean in isolation. See
   `src/vendor/allocate-hats/VENDOR.md`.
2. **YAML via js-yaml** (step 2). The hand-rolled fixture-YAML subset parser is
   replaced by `js-yaml`'s `load()` — the same library and entry point
   `@cursorless/lib-node-common`'s `loadFixture.ts` uses. `yaml-scalars.ts` was
   deleted; `parseFixtureYaml` and the `YamlValue` type surface are preserved.
3. **Workspace deps declared** (step 3). `package.json` now depends on
   `@cursorless/lib-common` and `@cursorless/lib-node-common` (`workspace:*`),
   plus `js-yaml ^5.2.1` and `@types/js-yaml ^4.0.9` (matching the versions
   lib-common / lib-node-common declare).
4. **Dedup review** (step 4). All three public-import candidates were evaluated
   and deliberately KEPT with provenance notes (switching each is invasive,
   regressive, or scope-ballooning — never their code needed changing):
   - `data/decorations.ts` `FlashStyle` — string union whose values match
     lib-common's `FlashStyle` enum, but it composes with `HighlightStyle` into
     `DecorationStyle` keys; enum switch churns literals for no gain.
   - `fixture-root.ts` — keeps its dual-layout probe + `$CURSORLESS_REPO`
     override; lib-node-common's `getFixturesPath` hardcodes one layout.
   - `fixture-extract.ts` `parseMarks`/`buildLines` — lib-common's
     `serializedMarksToTokenHats` needs a live `TextEditor` and returns engine
     `TokenHat[]`; our render model reads plain YAML with no editor.
5. **Compile config fixed**. Dropped the non-idiomatic
   `tsc --build`/composite setup (no sibling package uses it); `compile:tsc` is
   now plain `tsc`, matching the repo's typecheck convention (resolution via
   `tsconfig.base.json` `paths`). Fixed a real pre-existing type error:
   `pipeline.ts` used `GeneralizedRange` and `Pos` without importing them.

## Dedup against cursorless source (import-not-clone pass)

This pass replaced vendored/cloned code with imports from cursorless packages.
lib-engine gained additive exports (own commit) to make it possible.

- **DefaultMap / CompositeKeyMap** → imported from `@cursorless/lib-common`
  (deleted the two `vendor/allocate-hats/common/` copies).
- **GRAPHEME_SPLIT_REGEX** → imported from `@cursorless/lib-engine` in
  `columns.ts`, `tokenize.ts`, and `vendor/allocate-hats/splitter.ts` (was
  cloned in all three).
- **maxByFirstDiffering** → imported from `@cursorless/lib-engine` (deleted the
  vendored copy).
- **FlashStyle** → derived from `@cursorless/lib-common`'s enum via
  `` `${CursorlessFlashStyle}` `` (was a hand-maintained string union).
- **lib-engine exports added** (separate lib-engine commit): the allocateHats
  primitives + tokenGraphemeSplitter barrel now surface from the lib-engine
  index, so the above imports resolve.

**Still vendored, PINNED at SHA 42452eb on purpose** (current upstream has
diverged — importing would change hat placement or fail to typecheck against the
standalone's simplified types): `chooseTokenHat`, `HatMetrics`,
`getHatRankingContext`, `getTokenComparator`, `common/types.ts`, the tokens-in
`allocateHats` wrapper (`index.ts`), `rank.ts`, `StandaloneGraphemeSplitter`
(`splitter.ts`). Each file header states the exact reason; `VENDOR.md` has the
full split. Upstream added `forcedTokenHat` (#2602) and `avoidFirstLetter` /
`HatCandidate.isFirstLetter` (#1723), and the engine splitter needs a live IDE.

**Still local (fixture path/marks):** `parseMarks`/`buildLines` (needs no
TextEditor, unlike lib-common's `serializedMarksToTokenHats`), `fixture-root.ts`
(dual-layout probe + `$CURSORLESS_REPO` default, unlike lib-node-common's
single-layout `getFixturesPath`). `fixture-yaml.ts` already uses `js-yaml`.

## Colors / shapes data — step 6 decision: Option B (keep, with provenance)

The hat COLOR hexes, shape SVG `d=` path strings, color names, shape names, and
shape adjustments have **no importable TS module**, so they are KEPT in
`data/colors.ts` / `data/shapes.ts` with precise provenance comments naming the
exact upstream export that would be needed. Option A (add a canonical exported
constants module) was rejected because it cannot be done without either:

- creating a THIRD copy — the color hexes live in `app-vscode/package.json` as
  VS Code setting defaults (read at runtime, never a TS constant) and the SVG
  `d=` strings live in `resources/images/hats/*.svg` (read at runtime by
  `VscodeHatRenderer.ts`), so any new TS constant is a second/third copy; or
- a risky app-vscode refactor — `HAT_COLORS`/`HAT_SHAPES`/`HatShape` and
  `defaultShapeAdjustments` DO exist as clean TS constants in
  `app-vscode/src/ide/vscode/hatStyles.types.ts` and `.../hats/shapeAdjustments.ts`,
  but app-vscode exports only `./extension.cjs`, so single-sourcing them means
  promoting both into `@cursorless/lib-common` AND rewiring the 5 app-vscode
  files that consume them (VscodeHatRenderer, performPr1868ShapeUpdateInit, the
  two hatAdjustments scripts) — the shipping extension's hat path, out of scope.

**Follow-up (deferred):** promote `hatStyles.types.ts` + `shapeAdjustments.ts`
into lib-common and rewire those 5 app-vscode files; the `.svg` `d=` strings
would still need a separate build-time loader (or a generated TS constant) to
avoid a second copy.

## Security

- **CodeQL XSS (serialize-cascade.ts)** fixed: the attribute escaper now also
  escapes `"` (and `'`), so fixture/spoken-form strings can no longer break out
  of the double-quoted `data-fixture` / `data-spoken-form` attributes.

## Remaining blockers (NOT introduced by this work)

Running `pnpm compile` in the current checkout surfaces errors that are all
environmental (stale install) or pre-existing and out of scope for the dedup:

- **Stale node_modules / offline.** The installed toolchain is TypeScript 5.4.3
  and js-yaml 4.3.0, but `package.json`/lockfile pin TypeScript `^6.0.3` and
  js-yaml `^5.2.1`. TS 5.4.3 rejects the shared `tsconfig.base.json` `target:
  es2023` (`TS6046`), which cascades into a spurious `Set` iteration error in
  the vendored `rank.ts`. `@types/js-yaml` is also not installed, so
  `fixture-yaml.ts` reports `TS7016` (missing declaration for `js-yaml`). A
  `pnpm install` (needs network — offline install fails fetching
  `oxlint-tsgolint`, TS 6.0.3, js-yaml 5.2.1, `@types/js-yaml`) resolves all of
  these. Proof: typechecking this package with a valid target (es2022) + node
  types + a `declare module "js-yaml"` shim leaves ZERO errors in our code.
- **`./fixtures-vendored` missing** (`api-core.ts:47`, `TS2307`). `api-core.ts`
  imports `FIXTURE_IDS` / `SEQUENCES` / `VENDORED_FIXTURES` from a
  `src/fixtures-vendored` module that was never committed to this repo (it was a
  serverless-deployment artifact of the standalone repo — the "fixture
  ingestion" item from the original scaffold). This file is UNREACHABLE from the
  esbuild bundle entry (`src/index.ts` does not export `api-core.ts`), so it
  does not block `compile:esbuild`; it only trips the whole-tree `tsc`
  typecheck. Generating it is a separate task outside the dedup/compile scope
  and was intentionally NOT invented here.

## Verify

- Vendored tree, isolated: clean typecheck (esnext, self-contained).
- Whole package, valid target + js-yaml types available: only the
  out-of-scope `./fixtures-vendored` error remains.
