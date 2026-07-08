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
- `model/` — geometry.ts (Pos/Range + orderRange), frame-state.ts (CascadeState/Frame/Decoration/GeneralizedRange), columns.ts (Line/Token/Column geometry), overlays.ts (decoration → column overlay resolution), timeline.ts (frame timing)
- `logic/` — pipeline.ts, fixture-extract.ts, fixture-yaml.ts, fixture-root.ts, tokenize.ts, hat-allocator.ts, chain.ts
- `render/` — serialize.ts, serialize-cascade.ts, svg-wrap.ts, jumbotron.ts, css.ts, css-cascade.ts, symbols.ts, html.ts
- `index.ts` — the public surface; wires logic + render + model exports together.

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
