// Top-level orchestrator — the ONE legible, top-to-bottom view of the whole
// pipeline. Read this file to understand what the tool does, in four stages:
//
//   1. get what to render   (parse the fixture YAML)
//   2. tokenize each step    (documents → Frames: lines, hats, selections)
//   3. generate render object (Frames → CascadeState: flashes, during, overlays)
//   4. render from object     (CascadeState → animated SVG string)
//
// This module lives at the package ROOT (alongside index.ts), NOT inside
// logic/ or render/, because it is the ONE allowed composition point that spans
// BOTH scopes. The folder rule (logic/ ⊥ render/) is preserved: neither folder
// imports the other; only this root module and index.ts join them.

import {
  parseFixture,
  tokenizeStates,
  buildRenderObject,
  type PipelineOptions,
} from "./logic/pipeline";
import { serializeCascade } from "./render/serialize-cascade";
import { wrapCascadeSvg, type SvgWrapOptions } from "./render/svg-wrap";

/** Options for the end-to-end orchestrator: pipeline knobs + SVG-wrap knobs. */
export interface RenderCommandOptions extends PipelineOptions, SvgWrapOptions {}

/**
 * Render a single recorded fixture to a standalone animated SVG string.
 *
 * The four pipeline stages are visible at a glance below; each delegates to an
 * existing named function. Output is byte-identical to the equivalent
 * fixtureToCascade → serializeCascade → wrapCascadeSvg call chain.
 *
 * @param src        Fixture YAML text.
 * @param fixtureRel Relative fixture path (recorded into caption/meta).
 * @param opts       Pipeline + SVG-wrap options.
 */
export function renderCommand(
  src: string,
  fixtureRel: string,
  opts: RenderCommandOptions = {},
): string {
  const parsed = parseFixture(src, fixtureRel, opts); // 1. get what to render
  const tokenized = tokenizeStates(parsed, opts); //      2. tokenize each step
  const cascade = buildRenderObject(parsed, tokenized, opts); // 3. render object
  const inner = serializeCascade(cascade);
  return wrapCascadeSvg(cascade, inner, undefined, {
    flashPulseMs: opts.flashPulseMs,
  }); //                                                    4. render from object
}
