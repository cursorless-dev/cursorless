import { CommandId } from "@cursorless/common";
import {
  Capabilities,
  CapabilitiesCommand,
  CapabilitiesCommands,
} from "../../libs/common/ide/types/Capabilities";

const capabilitiesCommands: CapabilitiesCommands = {
  toggleLineComment: { acceptsLocation: false },
  indentLine: { acceptsLocation: false },
  outdentLine: { acceptsLocation: false },
  rename: { acceptsLocation: false },
  quickFix: { acceptsLocation: false },
  revealDefinition: { acceptsLocation: false },
  revealTypeDefinition: { acceptsLocation: false },
  showHover: { acceptsLocation: false },
  showDebugHover: { acceptsLocation: false },
  extractVariable: { acceptsLocation: false },
};

export class VscodeCapabilities implements Capabilities {
  public getCommand(commandId: CommandId): CapabilitiesCommand {
    const capabilities = capabilitiesCommands[commandId];

    if (capabilities == null) {
      throw Error(`Missing command capabilities for '${commandId}'`);
    }

    return capabilities;
  }
}
