# Upstream reuse opportunities

> Working/contributor doc (not shipped API). Tracks where `command-visualizer`
> could lean harder on existing cursorless code — split into what's **adoptable
> today** and what would need a **small upstream refactor + export** first.
> Goal: as a first-party package, reimplement as little as possible.

## Hat vocabulary: consolidated (and a remaining upstream cleanup)

The hat color/shape vocabulary (`HAT_COLORS`/`HAT_SHAPES`/`HatColor`/`HatShape`/…)
existed in FIVE places on upstream/main, but none was importable by another
package:

- `app-vscode/.../hatStyles.types.ts` — full exported set, but app-vscode ships
  only `extension.cjs`, so unreachable from other packages.
- private copies in 3 legacy command schemas (`CommandV0V1.types.ts`,
  `targetDescriptorV2.types.ts`, `PartialTargetDescriptorV3.types.ts`) — frozen
  historical formats, deliberately self-contained.
- a private `const HAT_COLORS` in `lib-talonjs-core/.../TalonJsTestHats.ts`.

This PR moved the vocabulary into `lib-common/src/ide/types/hatStyles.types.ts`
(previously just a `HatStyleName = string` stub) and rewired app-vscode to import
it — creating the first importable shared home and REDUCING duplication (app-vscode
no longer defines its own). command-visualizer imports this shared definition.

Remaining (upstream cleanup, NOT this PR): the 3 legacy schemas (frozen by design
— leave them) and the talonjs test const still hold private copies; a maintainer
could point the non-frozen ones at the shared lib-common home.

## Status: already reused (no action)

The package already imports from source rather than cloning:

- Hat allocation → real `@cursorless/lib-engine` `allocateHats` (via an in-memory
  `FakeIDE`/`InMemoryTextEditor`); the vendored copy is deleted.
- `HatColor`/`HAT_COLORS`, `HatShape`/`HAT_SHAPES`/`HAT_NON_DEFAULT_SHAPES`,
  `FlashStyle`, `DefaultMap`, `CompositeKeyMap`, `defaultShapeAdjustments`,
  `DEFAULT_HAT_HEIGHT_EM`/`DEFAULT_VERTICAL_OFFSET_EM` ← `@cursorless/lib-common`.
- `GRAPHEME_SPLIT_REGEX`, `maxByFirstDiffering`, `TokenGraphemeSplitter`,
  `getTokensInRange` ← `@cursorless/lib-engine`.
- `js-yaml` for fixture YAML.

Local-with-provenance (no importable TS source; canonical form is config/SVG):
`COLOR_MATRIX`, `DECORATION_HEX` (app-vscode `package.json` config defaults),
`SHAPE_PATHS` (`resources/images/hats/*.svg`, guarded by a drift test).

## Adoptable today — no upstream change needed

### Geometry: `Position` / `Range` / `GeneralizedRange`

- **What:** `@cursorless/lib-common` exports `Position` and `Range` classes (with
  `isEqual`/`isBefore`/`contains`/`with`/`fromConcise`), plus `GeneralizedRange`,
  `CharacterRange`, `LineRange`, and the helpers `isLineRange`, `toLineRange`,
  `toCharacterRange`, `generalizedRangeContains`/`generalizedRangeTouches`.
- **We currently hand-roll:** `model/geometry.ts` (`Pos`/`Range` plain interfaces +
  `orderRange`), the ordering/`before` comparison in `deriveSelections`, and
  containment math in `overlays.ts`. `model/frame-state.ts` defines its own
  `CharacterRange`/`LineRange`/`GeneralizedRange`.
- **Semantics already match:** cursorless `LineRange.end` is "Last line, inclusive"
  — identical to our `endLine`. The only deltas are our-side: plain interfaces →
  classes (construct `new Position()`/`new Range()` at the YAML boundary), and our
  `LineRange {startLine,endLine}` → cursorless's `{start,end}` (field rename, same
  meaning); `CharacterRange` uses `Position` instances.
- **Blocker:** none upstream. ~8-file our-side refactor.
- **Value:** deletes real hand-rolled ordering/containment logic; inherits tested
  behavior. **This is the queued geometry-adoption task.**

## Needs an upstream refactor + export first

Each of these is blocked by _coupling_ (live `TextEditor` / disk I/O / no pure
unit), not merely a missing export — so it needs a small cursorless-side change
before we can consume it. Listed by value.

| #   | If cursorless…                                                                                                                    | We'd delete                                                  | Value                            | Feasibility                          |
| --- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------------------------- | ------------------------------------ |
| 1   | extracted a **pure flash-derivation** — `diff(beforeDoc, afterDoc) → {pendingDelete, justAdded} ranges` — from the action runtime | `logic/derive-flashes.ts`                                    | **High** (real duplicated logic) | **Hard** — no pure unit exists today |
| 2   | offered an **editor-free `serializedMarksToTokenHats`** taking plain `{offset,text}` instead of a live `TextEditor`               | `parseMarks` + mark attachment in `logic/fixture-extract.ts` | Medium                           | Medium                               |
| 3   | exported a **grapheme-level tokenizer** (or made `getTokensInRange` output headless-consumable as a render model)                 | most of `logic/tokenize.ts`, part of `model/columns.ts`      | Medium                           | Medium (word-vs-grapheme gap)        |
| 4   | **parameterized fixture-path** resolution — `getFixturesPath(root)` instead of env-var-throw + one hardcoded layout               | `logic/fixture-root.ts`                                      | Low                              | Easy                                 |

### 1. Pure flash-derivation (highest value)

Today, cursorless flashes are a **runtime side-effect**: actions execute against a
live IDE and call `ide().flashRanges(...)` (see `lib-engine/src/actions/*`,
`core/updateSelections/`, `RangeUpdater`). There is no pure
"two document snapshots → flash ranges" function anywhere. Recorded fixtures
carry **zero** `ide.flashes`, so `derive-flashes.ts` reconstructs them from a
char-level prefix/suffix diff. If cursorless factored the edit→flash mapping into
a pure helper, we'd import it and delete our diff — and it would benefit
cursorless's own test/tooling surface, not just us. **Best upstream proposal
candidate.**

### 2. Editor-free marks → hats

`lib-common/src/util/serializedMarksToTokenHats.ts` hard-requires a live
`TextEditor` (`editor.document.offsetAt(range)`, `.getText(range)`) and returns
engine `TokenHat[]`. Our `parseMarks` reads plain fixture YAML (`{color}.{grapheme}`)
with no editor and yields the render-model `MarkInfo`. A pure core that takes
offsets/text (splitting the editor I/O from the mapping) would let us drop ours.

### 3. Grapheme tokenizer / headless token model

The engine tokenizer produces **word/token** units, not one-token-per-grapheme,
and isn't barrel-exported; `getTokensInRange` needs a live editor. `columns.ts`
also needs East-Asian display width — for which **no util exists anywhere** in the
monorepo. A grapheme-level tokenizer export (or a headless render-token producer)
would shrink `tokenize.ts`/`columns.ts`; the display-width piece would still be
ours unless cursorless grew one (it never needed display geometry).

### 4. Parameterized fixture path

`lib-node-common` `getCursorlessRepoRoot()` throws unless `CURSORLESS_REPO_ROOT`
is set, and `getFixturesPath` hardcodes the single `resources/fixtures` layout.
Ours does a dual-layout probe with a sensible default. A root-param overload would
let us drop `fixture-root.ts`.

## Not reusable (genuinely new — no upstream candidate)

- `model/timeline.ts` (animation timing), `logic/chain.ts` (multi-step chaining),
  `render/*` (HTML/CSS/SVG hat renderer — nothing like it exists upstream;
  `app-web-docs/Code.tsx` is Shiki syntax highlighting, unrelated).
- `model/overlays.ts` cross-decoration last-wins-per-cell precedence — lib-common's
  `decorationUtil` computes single-range **border geometry**, a different concern.
- `model/frame-state.ts` container types (checked 2026-07-08 against cursorless):
  its FIELD types already come from lib-common (`Position`/`Range`/`GeneralizedRange`),
  but the containers have no home. `Decoration {style,range,role}` is the only real
  shape-overlap — with `FlashDescriptor {style, editor, range}` — but that requires
  a live `TextEditor`, is flash-only (no `highlight0/1`), and lacks `role`; not
  adoptable without an editor-free + highlight-inclusive upstream refactor, and even
  then only partial. `Frame`/`CascadeState`/`CascadeMeta` are render/animation models
  distinct from `TestCaseSnapshot` (raw text + marks). `FrameRole`/`OverlayRole` are
  render enums. Do not re-chase.

## How to pursue

The geometry adoption is our-side and unblocked — do it directly. Items 1–4 are
upstream-contribution opportunities: raise as cursorless issues/PRs (extract the
pure core, add the export), then consume. Item 1 (pure flash-derivation) is the
highest-leverage and the most defensible as a general cursorless improvement.
