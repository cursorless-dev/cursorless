import type { CommandComplete } from "@cursorless/common";
import type { CommandResponse } from ".";

export interface CommandRunner {
  run(command: CommandComplete): Promise<CommandResponse | unknown>;
}
