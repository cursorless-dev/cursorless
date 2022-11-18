import { CommandId } from "./CommandId";

export interface Capabilities {
  commands: CapabilitiesCommands;
}

export type CapabilitiesCommands = Partial<
  Record<CommandId, CapabilitiesCommand>
>;

export interface CapabilitiesCommand {
  acceptsLocation: boolean;
}
