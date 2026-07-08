// Jumbotron shape — ported from Trillium's VisualizerWrapper implementation
// (cursorless fork branch gen_2026_01_20, packages/test-case-component/src/
// components/VisualizerWrapper/: JumbotronView.tsx, VisualizerMetadata.tsx,
// StateNavigationDots.tsx, VisualizerWrapper.css). See brain-a08pj.
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

import type { CascadeState } from "../model/frame-state";
import { MS_PER_STATE } from "../data/decorations";
import { frameDurMs, timelineOf } from "../model/timeline";
import { esc } from "./html";

const NL = String.fromCharCode(10);

/** Commands carried by the frames, in order. */
function frameCommands(state: CascadeState): string[] {
  return state.frames
    .map((f) => f.command)
    .filter((c): c is string => c != null && c !== "");
}

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

// ---------------------------------------------------------------------------
// CSS — ported from VisualizerWrapper.css / VisualizerMetadata.css, with
// docusaurus --ifm-* vars replaced by our theme vars, and the useAnimationState
// carousel replaced by --dur timeline animations.
// ---------------------------------------------------------------------------

/** Fraction of ONE slot spent sliding to the next command. */
const CMD_SLIDE_FRAC = 0.18;
/** Fraction of ONE slot the executed (lit) command holds before sliding out. */
const LIT_HOLD_FRAC = 0.25;
/** The command enters AT its step's initial start — the same beat as the
 * dot's level-1 transition (grey -> dim blue) — so "dot lights" and "bubble
 * animates into frame" are ONE visual event, not two. */
const ENTER_FRAC = 0;

export function jumbotronCss(
  state: CascadeState,
  flashPulseMs: number = 100,
): string {
  const n = Math.max(1, state.frames.length);
  const commands = frameCommands(state);

  const base = `
/* block, not inline-block: an inline-block wrapper sizes to max-content and
   the carousel chips (flex-basis 100%, nowrap) would inflate it to N x width */
.visualizer-wrapper { display: block; }
.visualizer-jumbotron .jumbotron-container { position: relative; }

.visualizer-command {
  overflow: hidden;
  margin-top: 8px;
}
.cl-cmd-track { display: flex; gap: 2%; }
/* CENTER-MODE conveyor: the ACTIVE command sits in the exact center of the
   jumbotron bar (70% chip + 15% lead/tail margins); the previous command's
   tail stays visible at the left, the next peeks at the right, and each
   slide lands the incoming command dead-center. */
.cl-cmd {
  flex: 0 0 70%;
  box-sizing: border-box;
  text-align: center;
  white-space: nowrap;
  /* no overflow clipping: the pill may grow past its cell (never truncate) */
}
.cl-cmd:first-child { margin-left: 15%; }
.cl-cmd:last-child { margin-right: 15%; }
/* The command is a PILL: text color is CONSTANT; the background carries the
   state (disabled -> active) via cmdlit-{i}. Entrance animates the pill into
   jumbospace (rise + fade). */
.cl-cmd-pill {
  display: inline-block;
  box-sizing: border-box;
  padding: 10px 28px;
  border-radius: 999px;
  font-size: 28px;
  line-height: 1.15;
  color: var(--pill-fg, #f2f2f2);
  background: var(--pill-disabled, #333);
  animation: cmdlit-0 var(--dur, 2000ms) linear 1 forwards paused;
}

.visualizer-metadata {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  margin-top: 8px;
  background: var(--jumbo-emphasis, #262626);
  border: 1px solid var(--jumbo-border, #3a3a3a);
  border-radius: 6px;
  font-size: 13px;
  color: var(--jumbo-fg, #d0d0d0);
}
.visualizer-metadata-item { display: flex; gap: 8px; align-items: baseline; }
.visualizer-metadata-item strong { font-size: 12px; opacity: 0.65; }
.meta-clips { position: relative; display: inline-block; min-height: 1.2em; flex: 1; }
.meta-clip {
  position: absolute;
  inset: 0;
  opacity: 0;
  white-space: pre;
  overflow: hidden;
  text-overflow: ellipsis;
  animation: f0 var(--dur, ${n * MS_PER_STATE}ms) steps(1, end) 1 forwards paused;
}
.meta-clip[data-slot="0"] { position: relative; }

.jumbotron-dots {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
  padding: 4px;
}
.jumbotron-dot {
  position: relative;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--jumbo-border, #4a4a4a);
  background: var(--jumbo-emphasis, #262626);
  box-sizing: border-box;
}
.jumbotron-dot-active {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background: var(--jumbo-primary, #4c9aff);
  border: 2px solid transparent;
  box-sizing: border-box;
  transform: scale(1.15);
  opacity: 0;
  /* two slots: [0] slot visibility (f{i}), [1] issued ring (dotissued-{i}) */
  animation:
    f0 var(--dur, ${n * MS_PER_STATE}ms) steps(1, end) 1 forwards paused,
    f0 var(--dur, ${n * MS_PER_STATE}ms) steps(1, end) 1 forwards paused;
}
`;

  const themed = `
.visualizer-jumbotron { --jumbo-emphasis: #262626; --jumbo-border: #3a3a3a; --jumbo-fg: #d0d0d0; --jumbo-primary: #4c9aff; --pill-fg: #f2f2f2; --pill-disabled: #333333; --pill-active: #1f6fd6; }
.visualizer-jumbotron[data-theme="light"] { --jumbo-emphasis: #f0f0f0; --jumbo-border: #c8c8c8; --jumbo-fg: #333; --jumbo-primary: #1a6ee0; --pill-fg: #ffffff; --pill-disabled: #9aa4b0; --pill-active: #1a6ee0; }
`;

  // Timeline-based windows (weighted phases: initial 1000ms, during 500ms).
  // COMMAND lifecycle: ABSENT -> ENTERED (muted) -> EXECUTED (lit at the
  // start of ITS during phase — when its referenceFlashes fire) -> carried
  // out by the (delayed) slide as the next step begins.
  const LIT_RAMP_MS = 150;
  // Slide fires AT the frame boundary — the dot advance and the command
  // slide are the SAME visual beat (they read as one motion).
  const LIT_HOLD_MS = 0;
  const SLIDE_MS = 220;
  const tl = timelineOf(state.frames);
  const durMs = tl.totalMs;
  const msPct = (ms: number) => (ms / durMs) * 100;
  const ramp = msPct(LIT_RAMP_MS);
  const pctc = (x: number) => `${Math.max(0, Math.min(100, x)).toFixed(3)}%`;

  const cmdFrames: number[] = [];
  state.frames.forEach((f, i) => {
    if (f.command != null && f.command !== "") {
      cmdFrames.push(i);
    }
  });
  const resetIdx = state.frames.findIndex((f) => f.reset);

  /** [startPct, endPct] of frame k's ISSUE window: its during phase when it
   *  has one, else a default-pulse sliver before the next frame. */
  const issueWindow = (k: number): [number, number] => {
    const next = state.frames[k + 1];
    if (next?.role === "during") {
      return [msPct(tl.startMs[k + 1]), msPct(tl.endMs[k + 1])];
    }
    const boundary = msPct(tl.endMs[k]);
    return [
      Math.max(msPct(tl.startMs[k]), boundary - msPct(flashPulseMs)),
      boundary,
    ];
  };

  let litKf = "";
  if (n >= 2 && commands.length >= 1) {
    const parts: string[] = [];

    // Dot phase levels (dotwin-{k}), one per step: disabled(0) ->
    // initial(0.45) -> during(1) -> after(1) -> disabled(0). The ring
    // (dotissued-{k}) marks the during phase distinctly, so level 2 reads
    // full+ring and level 3 full without.
    const L1 = 0.45;
    cmdFrames.forEach((k) => {
      const iniLo = msPct(tl.startMs[k]);
      const durFrame = state.frames[k + 1]?.role === "during" ? k + 1 : null;
      const durLo =
        durFrame != null ? msPct(tl.startMs[durFrame]) : msPct(tl.endMs[k]);
      const aftFrame = durFrame != null ? durFrame + 1 : k + 1;
      const aftLo = msPct(tl.startMs[aftFrame] ?? tl.endMs[k]);
      const aftHi = msPct(tl.endMs[aftFrame] ?? tl.endMs[k]);
      const kf = [
        `  0% { opacity: ${iniLo === 0 ? L1 : 0}; }`,
        ...(iniLo > 0
          ? [
              `  ${pctc(iniLo)} { opacity: 0; }`,
              `  ${pctc(iniLo + 0.001)} { opacity: ${L1}; }`,
            ]
          : []),
        `  ${pctc(durLo)} { opacity: ${L1}; }`,
        `  ${pctc(durLo + 0.001)} { opacity: 1; }`,
        `  ${pctc(aftHi)} { opacity: 1; }`,
        ...(aftHi < 100
          ? [
              `  ${pctc(aftHi + 0.001)} { opacity: 0; }`,
              `  100% { opacity: 0; }`,
            ]
          : [`  100% { opacity: 1; }`]),
      ];
      parts.push(`@keyframes dotwin-${k} {` + NL + kf.join(NL) + NL + `}`);
    });

    // ISSUED dot ring — white border across the step's during window.
    cmdFrames.forEach((k) => {
      if (state.frames[k + 1]?.role !== "during") {
        return;
      }
      const [wLo, wHi] = issueWindow(k);
      parts.push(
        `@keyframes dotissued-${k} {` +
          NL +
          `  0% { border-color: transparent; }` +
          NL +
          `  ${pctc(wLo)} { border-color: transparent; }` +
          NL +
          `  ${pctc(wLo + 0.001)} { border-color: #ffffff; }` +
          NL +
          `  ${pctc(wHi)} { border-color: #ffffff; }` +
          NL +
          `  ${pctc(wHi + 0.001)} { border-color: transparent; }` +
          NL +
          `  100% { border-color: transparent; }` +
          NL +
          `}`,
      );
    });

    // Command pills: entrance into jumbospace (chip 0 rises + fades in),
    // then the BACKGROUND carries disabled -> active (text color constant).
    const DIS = "var(--pill-disabled, #333)";
    const ACT = "var(--pill-active, #1f6fd6)";
    cmdFrames.forEach((k, i) => {
      const enterAt =
        msPct(tl.startMs[k]) + msPct(frameDurMs(state.frames[k])) * ENTER_FRAC;
      const [litStart] = issueWindow(k);
      const isLast = i === cmdFrames.length - 1;
      const kfParts: string[] = [];
      if (i === 0) {
        kfParts.push(
          `  0% { opacity: 0; transform: translateY(14px); background-color: ${DIS}; }`,
        );
        if (enterAt > 0) {
          kfParts.push(
            `  ${pctc(enterAt)} { opacity: 0; transform: translateY(14px); background-color: ${DIS}; }`,
          );
        }
        kfParts.push(
          `  ${pctc(enterAt + ramp)} { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
        );
      } else {
        kfParts.push(
          `  0% { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
        );
      }
      const effLit = Math.max(litStart, enterAt + ramp);
      // SNAP to active: the pill background flips at the EXACT instant the
      // dot ring turns white (both = the during start).
      if (effLit > 0) {
        kfParts.push(
          `  ${pctc(effLit)} { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
        );
      }
      if (isLast) {
        kfParts.push(
          `  ${pctc(Math.min(effLit + 0.001, 100))} { opacity: 1; transform: translateY(0); background-color: ${ACT}; }`,
        );
        if (resetIdx > 0) {
          const resetAt = msPct(tl.startMs[resetIdx]);
          kfParts.push(
            `  ${pctc(resetAt)} { opacity: 1; transform: translateY(0); background-color: ${ACT}; }`,
          );
          kfParts.push(
            `  ${pctc(resetAt + ramp)} { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
          );
          kfParts.push(
            `  100% { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
          );
        } else {
          kfParts.push(
            `  100% { opacity: 1; transform: translateY(0); background-color: ${ACT}; }`,
          );
        }
      } else {
        const nextStart = msPct(tl.startMs[cmdFrames[i + 1]]);
        const litEnd = nextStart + msPct(LIT_HOLD_MS + SLIDE_MS);
        kfParts.push(
          `  ${pctc(Math.min(effLit + 0.001, litEnd))} { opacity: 1; transform: translateY(0); background-color: ${ACT}; }`,
        );
        kfParts.push(
          `  ${pctc(litEnd)} { opacity: 1; transform: translateY(0); background-color: ${ACT}; }`,
        );
        kfParts.push(
          `  ${pctc(litEnd + ramp)} { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
        );
        kfParts.push(
          `  100% { opacity: 1; transform: translateY(0); background-color: ${DIS}; }`,
        );
      }
      parts.push(`@keyframes cmdlit-${i} {` + NL + kfParts.join(NL) + NL + `}`);
    });
    litKf = parts.join(NL) + NL;
  }

  if (commands.length <= 1) {
    return base + themed + litKf;
  }

  // Command carousel: slide to chip i+1 shortly after its step begins (the
  // previous chip lingers lit for LIT_HOLD_MS first), eased.
  const step = 72;
  const pos = (i: number) =>
    `transform: translateX(-${(i * step).toFixed(4)}%);`;
  const kf: string[] = [`  0% { ${pos(0)} }`];
  cmdFrames.slice(1).forEach((k, j) => {
    const at = msPct(tl.startMs[k]) + msPct(LIT_HOLD_MS);
    kf.push(`  ${pctc(at)} { ${pos(j)} }`);
    kf.push(`  ${pctc(at + msPct(SLIDE_MS))} { ${pos(j + 1)} }`);
  });
  kf.push(`  100% { ${pos(cmdFrames.length - 1)} }`);

  return (
    base +
    themed +
    litKf +
    "@keyframes cmdtrack {" +
    NL +
    kf.join(NL) +
    NL +
    "}" +
    NL +
    ".cl-cmd-track { animation: cmdtrack var(--dur, " +
    String(n * MS_PER_STATE) +
    "ms) cubic-bezier(0.4, 0, 0.2, 1) 1 forwards paused; }" +
    NL
  );
}
