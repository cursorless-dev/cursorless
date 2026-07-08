// CSS contract — SPEC §4. Generated from the single-sourced data so color +
// adjustment values never drift. No render-time JS; CSS does 100% of visual work.

import {
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  defaultShapeAdjustments as SHAPE_ADJUSTMENTS,
  HAT_COLORS,
  HAT_SHAPES,
} from "@cursorless/lib-common";
import { COLOR_MATRIX, EDITOR_CHROME } from "./data/colors";

function shapeAdjustmentRules(): string {
  const lines: string[] = [
    `.hat { --shape-size-adj: 0; --shape-voffset: 0em; }`,
  ];
  for (const shape of HAT_SHAPES) {
    const adj = SHAPE_ADJUSTMENTS[shape];
    const parts: string[] = [];
    if (adj.sizeAdjustment !== undefined) {
      // percent → fraction
      parts.push(`--shape-size-adj: ${adj.sizeAdjustment / 100};`);
    }
    if (adj.verticalOffset !== undefined) {
      // percent → em/100
      parts.push(`--shape-voffset: ${adj.verticalOffset / 100}em;`);
    }
    if (parts.length) {
      lines.push(
        `.ch--anchor[data-hat-shape="${shape}"] .hat { ${parts.join(" ")} }`,
      );
    }
  }
  return lines.join("\n");
}

function colorVarRules(): string {
  return HAT_COLORS.map(
    (c) =>
      `.ch--anchor[data-hat-color="${c}"] .hat { --hat-color: var(--c-${c}); }`,
  ).join("\n");
}

function themeVars(theme: "dark" | "light"): string {
  const cm = COLOR_MATRIX[theme];
  const ch = EDITOR_CHROME[theme];
  const colorVars = HAT_COLORS.map((c) => `  --c-${c}: ${cm[c]};`).join("\n");
  return (
    `.cl-editor[data-theme="${theme}"] {\n${colorVars}\n` +
    `  --editor-bg: ${ch.bg}; --editor-fg: ${ch.fg};` +
    ` --editor-sel: ${ch.sel}; --editor-caret: ${ch.caret};\n}`
  );
}

export function styleSheet(): string {
  return `/* Cursorless state → static CSS. SPEC §4. Generated; do not hand-edit. */

:root {
  --hat-height: ${DEFAULT_HAT_HEIGHT_EM}em;
  --hat-base-voffset: ${DEFAULT_VERTICAL_OFFSET_EM}em;
  --user-size-adj: 0;          /* cursorless.hatSizeAdjustment as fraction */
  --user-voffset: 0em;
  /* Real VS Code default line-height resolves to ~1.35× for the editor font
     (measured from screenshots/oracle/REAL-main-demo-frame1.png: 24px pitch
     over ~17.8px glyphs). Single-sourced here so the hat anchor can stay
     glyph-relative regardless of the chosen value. */
  --code-line-height: 1.35;
}

/* ---- per-shape adjustments (shapeAdjustments.ts, SPEC §4.2) ---- */
${shapeAdjustmentRules()}

/* ---- color tint vars (SPEC §4.4) ---- */
${colorVarRules()}

${themeVars("dark")}
${themeVars("light")}

/* ---- editor surface ---- */
@keyframes caretblink {
  0%, 55% { opacity: 1; }
  56%, 100% { opacity: 0; }
}
.caret { animation: caretblink 1.06s steps(1, end) infinite paused; }

.cl-editor {
  background: var(--editor-bg);
  color: var(--editor-fg);
  border-radius: 10px;
  overflow: hidden;
  padding: 1.2em 1em 1.6em;
  display: inline-block;
  min-width: 100%;
  box-sizing: border-box;
}
.cl-code {
  font-family: "JetBrains Mono", "SF Mono", "Menlo", ui-monospace, monospace;
  font-size: 18px;
  font-variant-ligatures: none;             /* D8: 1 glyph = its column(s) */
  font-feature-settings: "liga" 0, "calt" 0;
  letter-spacing: 0;
  line-height: var(--code-line-height);
  white-space: pre;
}
.cl-line { display: block; min-height: calc(var(--code-line-height) * 1em); }

/* The shared symbol-sheet <svg> (symbols.ts) is a 0×0 def holder, but an inline
   <svg> still generates a one-line-tall INLINE LINE BOX. As the first child of
   .cl-cascade — ahead of the in-flow position:relative frame 0 — that phantom
   line box shoved frame 0's content down by 1em (~18px) while the position:absolute
   later frames pinned to the padding box and ignored it, so the whole text block
   jittered 1em vertically on every frame snap. display:block kills the inline line
   box (0-height block contributes nothing), aligning frame 0 with the rest. */
svg.cl-defs { display: block; }

/* ---- per-char column grid (D8) ---- */
.ch {
  display: inline-block;
  position: relative;          /* hat's offset parent — no long-line drift */
  width: 1ch;
  text-align: center;
}
.ch[data-col-span="2"]  { width: 2ch; }
.ch[data-col-span="3"]  { width: 3ch; }
.ch[data-col-span="4"]  { width: 4ch; }
.ch[data-col-span="5"]  { width: 5ch; }
.ch[data-col-span="6"]  { width: 6ch; }
.ch[data-col-span="7"]  { width: 7ch; }
.ch[data-col-span="8"]  { width: 8ch; }

/* ---- hat (SPEC §4.3): tint via color + currentColor (D4) ---- */
.hat {
  position: absolute;
  left: 50%;
  height: calc(var(--hat-height) * (1 + var(--user-size-adj) + var(--shape-size-adj)));
  width:  calc(var(--hat-height) * (1 + var(--user-size-adj) + var(--shape-size-adj)) * 12 / 9);
  transform: translateX(-50%);
  /* Anchor the hat to the GLYPH TOP, not the line-box bottom, so it hugs the
     character cap regardless of line-height (cursorless positions the hat from
     the glyph: VscodeHatRenderer.ts:67, hatVOffsetPx = vOffsetEm*fontSize,
     glyph-relative). .ch is inline-block so its box height == line-height;
     the glyph content box (1em) is centered, leaving (line-height - 1em)/2 of
     half-leading above it. Add that half-leading back to the 1em baseline-stack
     so the hat sits just above the cap and never drifts into the inter-line gap
     when line-height changes.

     The final term mirrors cursorless's
     hatVerticalOffsetPx = (0.05 + voffsetEm)*fontSize - hatHeightPx/2
     (VscodeHatRenderer.ts:222-241). Cursorless lifts the hat bottom by half the
     RENDERED hat height, so taller shapes sink lower relative to the glyph top.
     Our eye-tuned baseline above already lands the DEFAULT shape correctly
     (which carries shapeSizeAdj -0.30), so we only need the per-shape DELTA from
     that default height -- subtracting (thisHatHeight - defaultShapeHatHeight)/2
     reproduces cursorless's -hatHeightPx/2 spread without disturbing the tuned
     default. thisHatHeight reuses the exact height calc; defaultShapeHatHeight
     is the same expression with shapeSizeAdj pinned to the default-shape -0.30. */
  bottom: calc(1em + (var(--code-line-height) - 1) * 0.5em
    + var(--hat-base-voffset) + var(--user-voffset) + var(--shape-voffset)
    - (var(--hat-height) * (1 + var(--user-size-adj) + var(--shape-size-adj))
       - var(--hat-height) * (1 + var(--user-size-adj) - 0.30)) / 2);
  color: var(--hat-color);
  pointer-events: none;
  overflow: visible;
  display: block;
}

/* ---- cursor + selection (SPEC §4.5) ---- */
.caret[data-cursor] {
  display: inline-block;
  width: 0; height: 1.2em;
  margin: 0 -1px;
  border-left: 2px solid var(--editor-caret);
  vertical-align: text-bottom;
}
.ch[data-sel] { background: var(--editor-sel); }

/* ---- optional line-number gutter (R3): OFF by default ----
   A leading inline-block .cl-lineno per .cl-line. Because the number shares the
   line box with its code, it aligns to that exact row automatically — works
   identically for single-frame renders and absolutely-positioned stacked cascade
   frames (no offset math). The gutter only exists when an ancestor carries
   data-line-numbers; absent that attribute, no .cl-lineno is emitted and output
   is byte-identical to the no-gutter render. */
:root {
  --gutter-digits: 2;                       /* widest line number's digit count */
  --gutter-pad-right: 1.1ch;                /* gap between numbers and code */
  --gutter-pad-left: 0.6ch;
}
.cl-lineno {
  display: inline-block;
  width: calc(var(--gutter-digits) * 1ch);
  padding-left: var(--gutter-pad-left);
  padding-right: var(--gutter-pad-right);
  text-align: right;                        /* VS Code: right-aligned numbers */
  color: var(--editor-fg);
  opacity: 0.42;                            /* dim, muted gray */
  font-variant-numeric: tabular-nums;
  user-select: none;
  pointer-events: none;
}
`;
}
