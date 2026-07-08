// Jumbotron command/dot @keyframes — the timeline-driven lit animation section
// of jumbotronCss. Extracted verbatim from jumbotron.ts so every jumbotron CSS
// module stays under the 250-line limit. render/ → render/ import only.

import type { CascadeState } from "../model/frame-state";
import { frameDurMs, timelineOf } from "../model/timeline";
import {
  NL,
  frameCommands,
  timelinePct,
  commandFrameIndices,
} from "./jumbotron-shared";

/** The command enters AT its step's initial start — the same beat as the
 * dot's level-1 transition (grey -> dim blue) — so "dot lights" and "bubble
 * animates into frame" are ONE visual event, not two. */
const ENTER_FRAC = 0;

/**
 * Build the dot + command-pill @keyframes block (dotwin-{k}, dotissued-{k},
 * cmdlit-{i}) for a multi-command cascade. Returns "" when the cascade has
 * fewer than two frames or no commands (single/empty renders emit no lit
 * keyframes). Identical to the inline builder that lived in jumbotronCss.
 */
export function litKeyframes(
  state: CascadeState,
  flashPulseMs: number = 100,
): string {
  const n = Math.max(1, state.frames.length);
  const commands = frameCommands(state);

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
  const { msPct, pctc } = timelinePct(tl);
  const ramp = msPct(LIT_RAMP_MS);

  const cmdFrames = commandFrameIndices(state);
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

  return litKf;
}
