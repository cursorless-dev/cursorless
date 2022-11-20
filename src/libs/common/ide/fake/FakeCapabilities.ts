import { Capabilities, CapabilitiesCommand } from "../types/Capabilities";
import { CommandId } from "../types/CommandId";

export class FakeCapabilities implements Capabilities {
  public getCommand(_commandId: CommandId): CapabilitiesCommand {
    throw Error("Not implemented");
  }
}
