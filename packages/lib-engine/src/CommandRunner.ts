import type { CommandComplete, CommandResponse } from "@cursorless/lib-common";

export interface CommandRunner {
  run(command: CommandComplete): Promise<CommandResponse>;
}
