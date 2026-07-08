// @cursorless/command-visualizer — public surface.
//
// fixture YAML in -> animated SVG out. See STATUS.md for integration state.

export {
  fixtureToCascade,
  parseFixture,
  tokenizeStates,
  buildRenderObject,
  type PipelineOptions,
  type ParsedFixture,
  type TokenizedStates,
} from "./logic/pipeline";
export {
  renderCommand,
  type RenderCommandOptions,
} from "./render-command";
export {
  chainCascades,
  withBumpers,
  ChainContinuityError,
} from "./logic/chain";
export {
  serializeCascade,
  serializeCascadeDocument,
} from "./render/serialize-cascade";
export { wrapCascadeSvg } from "./render/svg-wrap";
export { serializeJumbotron, jumbotronCss } from "./render/jumbotron";
export {
  timelineOf,
  frameDurMs,
  INITIAL_MS,
  DURING_MS,
  BUMPER_MS,
} from "./model/timeline";
export type { CascadeState, Frame } from "./model/frame-state";
