# command-visualizer — source architecture

A clear separation between **what is visually seen** and **what is under the hood**.

## The four scopes

```
data/    static constants (colors, decorations, shapes)
model/   the shared contract: types + PURE deterministic transforms both sides use
logic/   "under the hood": produces a CascadeState from a fixture (emits ZERO html)
render/  "what is visually seen": CascadeState -> HTML/CSS/SVG
```

- `data/` — colors.ts, decorations.ts, shapes.ts
- `model/` — types.ts (package-defined render-model types: CascadeState/Frame/Decoration/FrameRole/OverlayRole; geometry `Position`/`Range`/`GeneralizedRange` come from `@cursorless/lib-common`), columns.ts (Line/Token/Column geometry), overlays.ts (decoration → column overlay resolution), timeline.ts (frame timing)
- `logic/` — pipeline.ts, pipeline-types.ts, build-render-object.ts, fixture-extract.ts, fixture-yaml.ts, fixture-root.ts, tokenize.ts, hat-allocator.ts, chain.ts
- `render/` — serialize.ts, serialize-cascade.ts, svg-wrap.ts, jumbotron.ts, css.ts, css-cascade.ts, symbols.ts, html.ts
- `render-command.ts` — the top-level 4-stage orchestrator (root, spans logic + render).
- `index.ts` — the public surface; wires logic + render + model exports together.

## Pipeline — 4 stages

The whole tool is one legible top-to-bottom progression. Read `renderCommand`
in `render-command.ts` to see all four stages at a glance; each delegates to a
named function:

| #   | Stage                  | Function                              | File                                                |
| --- | ---------------------- | ------------------------------------- | --------------------------------------------------- |
| 1   | get what to render     | `parseFixture`                        | `logic/pipeline.ts`                                 |
| 2   | tokenize each step     | `tokenizeStates`                      | `logic/pipeline.ts`                                 |
| 3   | generate render object | `buildRenderObject`                   | `logic/build-render-object.ts`                      |
| 4   | render from object     | `serializeCascade` + `wrapCascadeSvg` | `render/serialize-cascade.ts`, `render/svg-wrap.ts` |

Stages 1–3 produce the `CascadeState` render object; stage 4 serializes it to
an animated SVG. `fixtureToCascade` (exported, unchanged behavior) is a thin
composition of stages 1–3; `renderCommand` composes all four. Shared stage
types live in `logic/pipeline-types.ts` so the stage files can reference the
contract without a circular import.

**Why the orchestrator lives at the root, not in `logic/`:** stage 4 is in
`render/`, and `logic/` must never import `render/` (the rule below). The
4-stage orchestrator therefore lives at the package root (`render-command.ts`,
alongside `index.ts`) — the ONE allowed composition point that may import from
both `logic/` and `render/`. Putting it inside `logic/` would create a
forbidden `logic/ → render/` edge.

## The one-directional dependency rule

**`render/` must NEVER import from `logic/`, and `logic/` must NEVER import from `render/`.**

Both scopes may import `model/` and `data/`. `model/` imports only `model/` and `data/`. Nothing imports `index.ts` internally.

```
        index.ts
        /      \
   logic/      render/     (siblings — no edge between them)
        \      /
        model/
          |
        data/
```

`columns`, `overlays`, and `timeline` live in `model/` (not `logic/` or `render/`) precisely because they are pure transforms consumed by BOTH sides — placing them in `model/` is what lets the rule hold automatically, so render can resolve every shared dependency without ever reaching into logic.

## Verifying the rule

```sh
# both MUST print nothing:
grep -rn 'from "\.\./logic/\|from "\./logic/' packages/command-visualizer/src/render
grep -rn 'from "\.\./render/\|from "\./render/' packages/command-visualizer/src/logic
```
