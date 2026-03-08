import type { CommandComplete, CommandResponse } from "@cursorless/common";

export interface CommandRunner {
  run(command: CommandComplete): Promise<CommandResponse>;
}
