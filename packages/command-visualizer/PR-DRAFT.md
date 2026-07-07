# PR draft — `@cursorless/command-visualizer`: animated SVG cascades from recorded fixtures

> Status: LOCAL DRAFT (2026-07-07). Not filed. Target: cursorless-dev/cursorless.
> Branch in fork: `command-visualizer` (scaffold commit `2b4d027`).

---

## What this adds

A new package, `@cursorless/command-visualizer`, that turns recorded test
fixtures (`data/fixtures/recorded/**/*.yml`) into **animated SVG
visualizations** of cursorless commands — before/during/after cascades with
real hat allocation, flash sequencing, selections, and a command "jumbotron"
— embeddable anywhere a plain `<img>` works (GitHub READMEs via camo, docs
pages, tutorials).

**Live demo of the exact code in this PR:**
https://cursorless-css-state.vercel.app/ (gallery) — e.g. the full
tutorial-1 sequence as one looping image:

```
/api/cascade?fixture=tutorial/tutorial-1-basics
```

The renderer is a pure function: fixture YAML in → self-contained SVG string
out. Zero runtime JavaScript in the output, no DOM or browser dependency to
render, and every animation rides one CSS `--dur` timeline so outputs are
deterministic and testable by seeking.

## Why cursorless might want this

- **Docs and tutorials that show, not tell.** Every recorded fixture becomes
  a looping visual: spoken command entering, flashes firing, the edit
  landing, hats reallocating. The tutorial sequences render as one
  continuous animation.
- **The fixtures are already the perfect substrate.** This consumes recorded
  test YAMLs verbatim — the corpus you already maintain becomes a
  documentation asset for free.
- **Faithful by construction, not by imitation:**
  - Hat allocation is _your_ algorithm (`chooseTokenHat` +
    `getHatRankingContext`, vendored verbatim; see companion proposal below),
    one hat per token, proven byte-identical to a bundled engine build.
  - Flash classes follow the action source exactly (matrix extracted from
    `packages/cursorless-engine/src/actions/*`): pre-edit flashes
    (`pendingDelete`, `referenced`, `pendingModification0/1`) precede the
    edit, `justAdded` follows it. The 100ms
    `pendingEditDecorationTime` pulse is pinned N-invariantly by a timing
    oracle. Timing is deliberately expanded for readability (documented
    divergence: pre-edit flashes render sequenced reference→delete rather
    than parallel).

## The model

```
pre (bumper) → [ step.initial → step.during → step.final ]* → post (reset)
```

- **Chains are contract-checked:** `finalState.i` must equal
  `initialState.{i+1}` (400 otherwise), and the boundary renders as ONE
  merged frame already wearing the next step's hats — one animated change,
  exactly as in the editor.
- **The during phase is the execution beat:** command pill activates, its
  step dot gains the issued ring, and flashes initiate — all in the same
  instant. Flash-less commands (pure selections) show their final state in
  this beat, matching the editor's instantaneous selection.
- **Durations are parameters** (`initial/during/bumper` ms, float `scale`),
  defaults `[2000, 1000, 500]`.
- Fixtures with no recorded `ide.flashes` (e.g. the tutorial corpus) get
  flashes **derived from the edit diff**; recorded flashes are used verbatim
  when present.

## Test story (ports with the package)

- 79 API-contract checks (params, typed errors, XML validity for
  `foreignObject`, real `<img>` SVG-as-image rendering in Chromium)
- 54 timeline e2e checks — WAAPI seek to exact beats: flash windows and
  doomed-token ranges, pill/dot/flash simultaneity, backward hat flow
  (merged-frame hat signature must equal a standalone render of the next
  step's initial state), command centering (±2px), never-truncate text
  fitting, no-seek wall-clock animation liveness
- 24 SVG layout checks (content fits the declared viewport across the
  corpus, chains, themes)
- Flash-timing oracle: insert = 100ms N-invariant; delete windows structural
- Plus the renderer's own column-model / roundtrip / pixel-oracle suites

## Companion proposal (separable)

`@cursorless/hat-allocator`: export the allocation subgraph
(`allocateHats`'s unexported loop + `chooseTokenHat` +
`getHatRankingContext` + a static-config grapheme splitter) as a standalone
entry point with a tokens-in interface. Three downstream re-implementations
currently vendor or re-bundle this identical code (Talon prose overlay, an
iOS port's oracle, this renderer); one exported entry point serves all. The
extraction shipped standalone as `allocate-hats` with a 200-case
byte-equivalence proof against a bundled engine build — the PR would move it
inward and dissolve the dependency.

## Open questions for maintainers

1. **Package name/home**: `packages/command-visualizer` (naming rationale:
   describes what the viewer sees — a command executing — rather than the
   implementation; considered `cascade-renderer`, `fixture-visualizer`,
   `test-case-visualizer`) vs living beside
   `test-case-component` (which it complements: static React component vs
   embeddable animated SVG).
2. **Fixture ingestion**: read `data/fixtures/recorded/**` directly
   in-monorepo (the standalone deploy vendors YAMLs for serverless).
3. **Hosting**: should cursorless.org serve the endpoint (docs embeds), or
   is the library alone in scope?
4. **Timing divergence**: is the expanded pedagogical timing acceptable as
   the default, given the faithful 100ms mode is one parameter away
   (`scale`/`flash`)?

## Checklist

- [ ] Re-vendor allocation against `packages/lib-engine` @ upstream HEAD —
      the algorithm evolved since the 42452eb pin (`forcedTokenHat` param,
      `avoidFirstLetter` metric, `lib-common` rename); assignments change,
      so a fresh equivalence baseline is required (task-1e8 in the
      standalone repo)
- [ ] `pnpm compile` green in-monorepo (scaffold imports verbatim; two
      integration seams documented in `STATUS.md`)
- [ ] Port the gate suites into the monorepo test layout
- [ ] Companion hat-allocator PR (or fold into this one per maintainer
      preference)
- [ ] Docs page embedding a live cascade
