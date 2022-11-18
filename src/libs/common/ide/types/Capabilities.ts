import { CommandId } from "./CommandId";

export interface Capabilities {
  readonly getCommand: (commandId: CommandId) => CapabilitiesCommand;
}

export type CapabilitiesCommands = Partial<
  Record<CommandId, CapabilitiesCommand>
>;

export interface CapabilitiesCommand {
  acceptsLocation: boolean;
}
