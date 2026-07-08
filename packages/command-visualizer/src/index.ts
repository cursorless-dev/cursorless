// @cursorless/command-visualizer — public surface.
//
// fixture YAML in -> animated SVG out. See STATUS.md for integration state.

export { fixtureToCascade, type PipelineOptions } from "./pipeline";
export { chainCascades, withBumpers, ChainContinuityError } from "./chain";
export {
  serializeCascade,
  serializeCascadeDocument,
} from "./serialize-cascade";
export { wrapCascadeSvg } from "./svg-wrap";
export { serializeJumbotron, jumbotronCss } from "./jumbotron";
export {
  timelineOf,
  frameDurMs,
  INITIAL_MS,
  DURING_MS,
  BUMPER_MS,
} from "./timeline";
export type { CascadeState, Frame } from "./frame-state";
