// Jumbotron shape — ported from a cursorless VisualizerWrapper implementation
// (packages/test-case-component/src/components/VisualizerWrapper/:
// JumbotronView.tsx, VisualizerMetadata.tsx, StateNavigationDots.tsx,
// VisualizerWrapper.css).
//
// EVERY render uses the jumbo shape, one step or many:
//
//   <div class="visualizer-wrapper visualizer-jumbotron">
//     <div class="jumbotron-container">   <- the cl-cascade frame carousel
//     <div class="visualizer-command">    <- command bar (carousel for chains)
//     <div class="visualizer-metadata">   <- clipboard, when the fixture has it
//     <div class="jumbotron-dots">        <- one dot per frame, active follows
//   </div>
//
// The React original drives state with useAnimationState + click handlers;
// this port drives the SAME shape with pure CSS on the shared --dur timeline
// (dots and metadata reuse the per-frame f{i} opacity keyframes), so the GIF
// harness (WAAPI seek) and SVG-as-image delivery both animate it and no JS is
// required. Interactive Controls (pause / highlight toggles) are NOT portable
// to SVG-as-image and are intentionally omitted.
//
// The CSS half (jumbotronCss) lives in ./jumbotron-css (+ -keyframes); it is
// re-exported below so the public surface (index.ts) is unchanged.

import type { CascadeState } from "../model/types";
import { timelineOf } from "../model/timeline";
import { esc } from "./html";
import { NL, frameCommands } from "./jumbotron-shared";

export { jumbotronCss } from "./jumbotron-css";

function hasClipboard(state: CascadeState): boolean {
  return state.frames.some((f) => f.clipboard != null);
}

// ---------------------------------------------------------------------------
// Markup
// ---------------------------------------------------------------------------

/** Command bar — single command sits static; chains carousel (cmdtrack). */
const PILL_FONT_MAX = 28;
const PILL_FONT_MIN = 14;
const PILL_PAD_X = 28; // matches .cl-cmd-pill horizontal padding
const MONO_CH_EM = 0.78; // matches svg-wrap CH_EM (SVG-image fallback mono)

/** Largest font (<= 28px) at which the quoted text fits the bar width. */
function pillFontPx(text: string, barWidthPx: number): number {
  const chars = text.length + 2; // + quotes
  const avail = barWidthPx * 0.96 - PILL_PAD_X * 2;
  const fit = Math.floor(avail / (chars * MONO_CH_EM));
  return Math.max(PILL_FONT_MIN, Math.min(PILL_FONT_MAX, fit));
}

function commandBar(state: CascadeState, barWidthPx?: number): string {
  const commands = frameCommands(state);
  if (commands.length === 0) {
    return "";
  }
  const n = Math.max(1, state.frames.length);
  const animated = n >= 2;
  const chips = commands
    .map((c, i) => {
      // The bubble is NEVER truncated: it may grow past its 70% carousel cell
      // toward the full bar width, and the text shrinks to fit.
      const font =
        barWidthPx != null ? pillFontPx(c, barWidthPx) : PILL_FONT_MAX;
      const styles = [
        animated ? `animation-name: cmdlit-${i}` : "",
        font !== PILL_FONT_MAX ? `font-size: ${font}px` : "",
      ]
        .filter(Boolean)
        .join("; ");
      return (
        `<span class="cl-cmd"><span class="cl-cmd-pill"${styles ? ` style="${styles}"` : ""}>` +
        `&quot;${esc(c)}&quot;</span></span>`
      );
    })
    .join("");
  return (
    `<div class="visualizer-command" style="--dur:${timelineOf(state.frames).totalMs}ms;">` +
    `<div class="cl-cmd-track">${chips}</div></div>`
  );
}

/**
 * Clipboard metadata — the VisualizerMetadata block. Per-frame values stack
 * like cascade frames; the one for the active slot fades in via f{i}.
 */
function metadataBlock(state: CascadeState): string {
  if (!hasClipboard(state)) {
    return "";
  }
  const n = Math.max(1, state.frames.length);
  const slots = state.frames
    .map(
      (f, i) =>
        `<code class="meta-clip" data-slot="${i}" style="animation-name: f${i}">` +
        `${esc(f.clipboard ?? "(empty)")}</code>`,
    )
    .join("");
  return (
    `<div class="visualizer-metadata" style="--dur:${timelineOf(state.frames).totalMs}ms;">` +
    `<div class="visualizer-metadata-item"><strong>Clipboard:</strong>` +
    `<span class="meta-clips">${slots}</span></div></div>`
  );
}

/** Navigation dots — one per frame; the active marker follows the timeline. */
function dots(state: CascadeState): string {
  const n = Math.max(1, state.frames.length);
  if (n < 2) {
    return "";
  }
  // ONE dot per STEP. The dot expresses the step phase as intensity:
  //   disabled (0) -> initial (level 1, dim) -> during (level 2, full +
  //   white ring) -> after (level 3, full) -> disabled.
  // Single-step renders therefore have a single dot. In chains, a step's
  // AFTER overlaps the next step's INITIAL on the merged frame — dot i at
  // level 3 while dot i+1 sits at level 1, expressing the shared state.
  const items = state.frames
    .map((f, i) => {
      if (f.command == null || f.command === "") {
        return "";
      }
      const hasDuring = state.frames[i + 1]?.role === "during";
      const names = hasDuring ? `dotwin-${i}, dotissued-${i}` : `dotwin-${i}`;
      return (
        `<span class="jumbotron-dot" data-slot="${i}" title="step">` +
        `<span class="jumbotron-dot-active" style="animation-name: ${names}"></span></span>`
      );
    })
    .join("");
  return `<div class="jumbotron-dots" aria-hidden="true" style="--dur:${timelineOf(state.frames).totalMs}ms;">${items}</div>`;
}

/**
 * Wrap a serialized cascade in the full jumbotron shape.
 * @param inner serializeCascade(state) markup (the frame carousel).
 */
export function serializeJumbotron(
  state: CascadeState,
  inner: string,
  opts: { barWidthPx?: number } = {},
): string {
  return (
    `<div class="visualizer-wrapper visualizer-jumbotron" data-theme="${state.theme}">` +
    NL +
    `<div class="jumbotron-container">${NL}${inner}${NL}</div>` +
    NL +
    commandBar(state, opts.barWidthPx) +
    NL +
    metadataBlock(state) +
    NL +
    dots(state) +
    NL +
    `</div>`
  );
}
