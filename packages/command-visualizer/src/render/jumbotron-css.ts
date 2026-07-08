// Jumbotron CSS — ported from VisualizerWrapper.css / VisualizerMetadata.css,
// with docusaurus --ifm-* vars replaced by our theme vars, and the
// useAnimationState carousel replaced by --dur timeline animations. Extracted
// from jumbotron.ts (which keeps the markup half) so every module stays under
// the 250-line limit. The command/dot @keyframes live in
// ./jumbotron-css-keyframes; this module assembles base + themed + those
// keyframes + the carousel track. render/ → render/ import only.

import type { CascadeState } from "../model/types";
import { MS_PER_STATE } from "../data/decorations";
import { timelineOf } from "../model/timeline";
import {
  NL,
  frameCommands,
  timelinePct,
  commandFrameIndices,
} from "./jumbotron-shared";
import { litKeyframes } from "./jumbotron-css-keyframes";

/** Base layout + component CSS (carousel, pill, metadata, dots). */
function baseCss(n: number): string {
  return `
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
}

/** Theme variable definitions (dark default + light override). */
function themedCss(): string {
  return `
.visualizer-jumbotron { --jumbo-emphasis: #262626; --jumbo-border: #3a3a3a; --jumbo-fg: #d0d0d0; --jumbo-primary: #4c9aff; --pill-fg: #f2f2f2; --pill-disabled: #333333; --pill-active: #1f6fd6; }
.visualizer-jumbotron[data-theme="light"] { --jumbo-emphasis: #f0f0f0; --jumbo-border: #c8c8c8; --jumbo-fg: #333; --jumbo-primary: #1a6ee0; --pill-fg: #ffffff; --pill-disabled: #9aa4b0; --pill-active: #1a6ee0; }
`;
}

/**
 * Command carousel track: slide to chip i+1 shortly after its step begins (the
 * previous chip lingers lit for LIT_HOLD_MS first), eased. Only emitted for
 * multi-command cascades (commands.length > 1).
 */
function carouselTrack(state: CascadeState, n: number): string {
  const LIT_HOLD_MS = 0;
  const SLIDE_MS = 220;
  const tl = timelineOf(state.frames);
  const { msPct, pctc } = timelinePct(tl);
  const cmdFrames = commandFrameIndices(state);

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

export function jumbotronCss(
  state: CascadeState,
  flashPulseMs: number = 100,
): string {
  const n = Math.max(1, state.frames.length);
  const commands = frameCommands(state);

  const base = baseCss(n);
  const themed = themedCss();
  const litKf = litKeyframes(state, flashPulseMs);

  if (commands.length <= 1) {
    return base + themed + litKf;
  }

  return base + themed + litKf + carouselTrack(state, n);
}
