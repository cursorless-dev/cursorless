// Wrap a serialized cascade in an <img>-embeddable animated SVG — the
// github-readme-stats delivery model: SVG + embedded CSS animation +
// <foreignObject> for the HTML markup. No JS, no external resources, so it
// renders in SVG-as-image mode (GitHub camo, <img> tags, markdown).
//
// Dimensions: SVG viewports are fixed-size, so we estimate from the state's
// column/row extents. Layout inside is ch-based (css.ts), so column MATH
// survives any monospace fallback; the estimate only needs enough slack that
// the widest expected monospace advance (~0.62em) never clips.

import type { CascadeState } from "../model/types";
import { serializeCascade } from "./serialize-cascade";
import { jumbotronCss, serializeJumbotron } from "./jumbotron";
import { styleSheet } from "./css";
import { cascadeStyleSheet, cascadeThemeBridge } from "./css-cascade";
import { captionHtml, themeBackground } from "./html";

const FONT_PX = 18; // .cl-code font-size (css-cascade.ts)
const LINE_HEIGHT = 1.35; // --code-line-height default
// Monospace advance estimate. SVG-as-image cannot load web fonts, and the
// viewer's fallback monospace varies: JetBrains/Menlo ~0.6em, but Chromium's
// SVG-image fallback measures ~0.75em. Size for the widest so nothing clips;
// narrow-font viewers just get extra right padding.
const CH_EM = 0.78;
const PAD_PX = 24; // body padding in the HTML document version
const CAPTION_PX = 26; // caption line + margin when meta present

export interface SvgWrapOptions {
  /**
   * Flash pulse width in ms (delete red / insert green). Default 100 = the
   * fidelity-pinned cursorless pulse; raise it as a VIEWING aid so the flash
   * reads clearly at normal cadence. Clamped to one slot.
   */
  flashPulseMs?: number;
}

function extent(state: CascadeState): { cols: number; rows: number } {
  let cols = 20;
  let rows = 1;
  for (const frame of state.frames) {
    rows = Math.max(rows, frame.lines.length);
    for (const line of frame.lines) {
      const last = line.tokens[line.tokens.length - 1];
      if (last) {
        cols = Math.max(cols, last.range.end);
      }
    }
  }
  return { cols, rows };
}

/**
 * Build the standalone animated SVG for a cascade state.
 *
 * @param inner Pre-serialized cascade markup (serializeCascade(state)) — the
 * serializer emits XML-well-formed div/span/svg markup, which foreignObject
 * requires.
 */
export function wrapCascadeSvg(
  state: CascadeState,
  inner: string = serializeCascade(state),
  css?: string,
  opts: SvgWrapOptions = {},
): string {
  const { cols, rows } = extent(state);
  const hasCaption = state.meta != null;
  const hasCommands = state.frames.some((f) => f.command);
  const hasClip = state.frames.some((f) => f.clipboard != null);
  const multiFrame = state.frames.length >= 2;
  // Jumbotron chrome below the code box: command bar + metadata + dots.
  const STRIP_PX =
    (hasCommands ? 70 : 0) + (hasClip ? 56 : 0) + (multiFrame ? 32 : 0);
  // The cascade box carries its own internal padding (1.2em top, 1.6em
  // bottom, 1em sides — css-cascade.ts) on top of the outer PAD_PX.
  const boxPadX = 2 * FONT_PX; // 1em + 1em
  const boxPadY = 2.8 * FONT_PX; // 1.2em + 1.6em
  // Width drivers: the CODE, and the LONGEST COMMAND PILL at full 28px —
  // the full command text must always be readable, growing the canvas
  // in preference to shrinking text (truncation is never allowed).
  const longestCmd = Math.max(
    0,
    ...state.frames.map((f) => (f.command ? f.command.length + 2 : 0)),
  );
  const pillPx = longestCmd > 0 ? longestCmd * 28 * CH_EM + 2 * 28 + 24 : 0;
  const width = Math.ceil(
    Math.max(cols * FONT_PX * CH_EM + boxPadX, pillPx) + PAD_PX * 2 + 8,
  );
  const captionCols = state.meta?.fixture?.length ?? 0;
  const captionLineCh = Math.max(
    10,
    Math.floor((width - PAD_PX * 2) / (12 * 0.62)),
  );
  const captionLines = hasCaption
    ? Math.max(1, Math.ceil(captionCols / captionLineCh))
    : 0;
  const height = Math.ceil(
    rows * FONT_PX * LINE_HEIGHT +
      boxPadY +
      PAD_PX * 2 +
      (hasCaption ? CAPTION_PX + (captionLines - 1) * 16 : 0) +
      STRIP_PX +
      10,
  );

  // Durations live on the frames (frame.durMs, resolved at the API layer);
  // the serializers emit scaled --dur values directly — no rewrite pass.
  const markup = serializeJumbotron(state, inner, {
    barWidthPx: width - PAD_PX * 2,
  });

  const bg = themeBackground(state.theme);
  const caption = captionHtml(state.meta);
  // The cascade stylesheet ships animation-play-state: paused (the GIF
  // harness seeks frames via WAAPI). A delivered SVG has no harness — for
  // multi-frame cascades, un-pause and loop forever (readme-embed behavior).
  // Single-frame states stay static. Same-specificity override placed AFTER
  // the base sheet wins by order.
  const animate =
    state.frames.length >= 2
      ? `\n.cl-cascade .frame, .cl-cascade .ch[data-flash], .cl-cmd-track, .cl-cmd-pill, .caret, .meta-clip, .jumbotron-dot-active { animation-play-state: running !important; animation-iteration-count: infinite !important; }`
      : "";
  const style =
    (css ??
      `${styleSheet()}\n${cascadeThemeBridge()}\n${cascadeStyleSheet(state.frames, opts.flashPulseMs)}\n${jumbotronCss(state, opts.flashPulseMs)}`) +
    animate;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
<rect width="100%" height="100%" fill="${bg}"/>
<foreignObject x="0" y="0" width="${width}" height="${height}">
<div xmlns="http://www.w3.org/1999/xhtml" style="padding:${PAD_PX}px; font-family:ui-monospace,monospace; background:${bg};">
<style>/*<![CDATA[*/
.cl-caption { color: #888; font-size: 12px; margin-bottom: 10px; }
${style}
/*]]>*/</style>
${caption}
${markup}
</div>
</foreignObject>
</svg>`;
}
