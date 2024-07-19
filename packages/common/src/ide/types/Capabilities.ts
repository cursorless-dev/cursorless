import { CommandId } from "./CommandId";

export interface Capabilities {
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
