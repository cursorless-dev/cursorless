import { CommandId } from "./CommandId";

export interface Capabilities {
  readonly commands: CommandCapabilityMap;
}

export type CommandCapabilityMap = Record<CommandId, CommandCapabilities | undefined>;

export interface CommandCapabilities {
  acceptsLocation: boolean;
}
