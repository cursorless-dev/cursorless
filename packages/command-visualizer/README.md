# @cursorless/command-visualizer

Turn recorded cursorless test fixtures into **animated SVG visualizations** of
commands — before/during/after cascades with real hat allocation, flash
sequencing, selections, and a command "jumbotron". The output is a
self-contained SVG string embeddable anywhere a plain `<img>` works (GitHub
READMEs via camo, docs pages, tutorials).

The renderer is a pure function: fixture YAML in → self-contained SVG string
out. There is zero runtime JavaScript in the output, no DOM or browser
dependency to render, and every animation rides one CSS `--dur` timeline, so
outputs are deterministic and testable by seeking.

```ts
import { renderCommand } from "@cursorless/command-visualizer";

const svg = renderCommand(fixtureYamlText, "recorded/foo/bar.yml", {
  theme: "dark",
});
```

## The animation model

```
pre (bumper) → [ step.initial → step.during → step.final ]* → post (reset)
```

- **The during phase is the execution beat:** the command pill activates, its
  step dot gains the issued ring, and flashes initiate — all in the same
  instant. Flash-less commands (pure selections) show their final state in this
  beat, matching the editor's instantaneous selection.
- **Chains are contract-checked:** `finalState.i` must equal
  `initialState.{i+1}`, and the boundary renders as ONE merged frame already
  wearing the next step's hats — one animated change, exactly as in the editor.
- **Durations are parameters** (`initial` / `during` / `bumper` ms, plus a float
  `scale`); defaults are `[2000, 1000, 500]`.
- Fixtures with no recorded `ide.flashes` (e.g. the tutorial corpus) get flashes
  **derived from the edit diff**; recorded flashes are used verbatim when
  present.

Flash classes follow the action source exactly: pre-edit flashes
(`pendingDelete`, `referenced`, `pendingModification0`/`1`) precede the edit and
`justAdded` follows it. The 100ms `pendingEditDecorationTime` pulse is pinned
N-invariantly (independent of the number of frames). Pre-edit flashes render
sequenced (reference → delete) rather than in parallel — a deliberate
readability divergence from the editor.

## Architecture

Source is organized into four scopes with a strict one-directional dependency
rule (`render/` and `logic/` never import each other). The layering diagram, the
4-stage pipeline table, and the grep commands that verify the dependency rule
live in [`src/ARCHITECTURE.md`](./src/ARCHITECTURE.md).

## Reuse of cursorless source

This package deliberately imports from cursorless packages rather than cloning,
and documents the cases where a local copy is the faithful choice.

Imported from cursorless (not cloned):

- `DefaultMap` / `CompositeKeyMap`, `FlashStyle` — from `@cursorless/lib-common`.
- `GRAPHEME_SPLIT_REGEX`, `maxByFirstDiffering`, the `allocateHats` primitives —
  from `@cursorless/lib-engine`.
- Fixture YAML is parsed with `js-yaml` (the same library `@cursorless/lib-node-common`'s
  `loadFixture.ts` uses).

Kept local, with provenance, where importing would regress or balloon scope:

- **`data/decorations.ts`** — `FlashStyle` is a string union derived from
  lib-common's `FlashStyle` enum; it composes with `HighlightStyle` into the
  `OverlayStyleName` keys. The `DECORATION_HEX` values, pulse timing, and
  precedence are local (cursorless does not export them). Note: this package's
  `OverlayStyleName` is unrelated to lib-common's `DecorationStyle` (a
  border-geometry interface) — the rename avoids that collision.
- **`data/colors.ts` / `data/shapes.ts`** — the color hexes live in
  `app-vscode/package.json` as VS Code setting defaults (read at runtime, never a
  TS constant) and the shape SVG `d=` path strings live in
  `resources/images/hats/*.svg` (read at runtime by `VscodeHatRenderer`). There
  is no importable TS module, so these are mirrored here with provenance comments
  naming the exact upstream source.
- **`logic/fixture-root.ts`** — keeps its dual directory-layout probe and
  `$CURSORLESS_REPO` override; lib-node-common's `getFixturesPath` hardcodes one
  layout and throws unless `CURSORLESS_REPO_ROOT` is set.
- **`logic/fixture-extract.ts`** — `parseMarks` / `buildLines` read plain YAML
  with no editor, whereas lib-common's `serializedMarksToTokenHats` needs a live
  `TextEditor` and returns engine `TokenHat[]`.

## Development

```sh
# typecheck
tsc -p packages/command-visualizer/tsconfig.json --noEmit
```

The renderer resolves recorded fixtures from a cursorless checkout. Set
`CURSORLESS_REPO` to point at your checkout if it is not at
`$HOME/code/cursorless`.
