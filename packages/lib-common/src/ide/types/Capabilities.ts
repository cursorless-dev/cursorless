import type { CommandId } from "./CommandId";

export interface Capabilities {
  /**
   * Capabilities of the commands that the IDE supports. Note that for many of
   * these commands, if the IDE does not support them, Cursorless will have a
   * fairly sophisticated fallback, so it may actually better to report
   * `undefined`. This will vary per action, though. In the future We will
   * improve our per-action types / docstrings to make this more clear; see
   * #1233
   */
  readonly commands: CommandCapabilityMap;
}

type SimpleCommandCapabilityMap = Record<
  CommandId,
  CommandCapabilities | undefined
>;

export interface CommandCapabilityMap extends SimpleCommandCapabilityMap {
  clipboardPaste: boolean | undefined;
}

export interface CommandCapabilities {
  acceptsLocation: boolean;
}
