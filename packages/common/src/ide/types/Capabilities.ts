import { CommandId } from "./CommandId";

export interface Capabilities {
  readonly commands: CommandCapabilityMap;
}

type CommonCommandCapabilityMap = Record<
  CommandId,
  CommandCapabilities | undefined
>;

export interface CommandCapabilityMap extends CommonCommandCapabilityMap {
  insertLineAfter: object | undefined;
}

export interface CommandCapabilities {
  acceptsLocation: boolean;
}
