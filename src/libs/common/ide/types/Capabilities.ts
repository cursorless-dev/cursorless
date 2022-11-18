export interface Capabilities {
  commands: CapabilitiesCommands;
}

export type CapabilitiesCommands = Partial<
  Record<CapabilityCommandId, CapabilitiesCommand>
>;

export type CapabilityCommandId = "toggleLineComment";

export interface CapabilitiesCommand {
  acceptsLocation: boolean;
}
