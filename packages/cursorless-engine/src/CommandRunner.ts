import { CommandComplete } from "@cursorless/common";

export interface CommandRunner {
  run(command: CommandComplete): Promise<unknown>;
}
