import type { ActionCommand } from "./ActionCommand";
import type { CommandV5 } from "./CommandV5.types";
import type { CommandV0, CommandV1 } from "./legacy/CommandV0V1.types";
import type { CommandV2 } from "./legacy/CommandV2.types";
import type { CommandV3 } from "./legacy/CommandV3.types";
import type { CommandV4 } from "./legacy/CommandV4.types";

export type CommandComplete = Required<Omit<CommandLatest, "spokenForm">> &
  Pick<CommandLatest, "spokenForm"> & { action: Required<ActionCommand> };

export const LATEST_VERSION = 5 as const;

export type CommandLatest = Command & {
  version: typeof LATEST_VERSION;
};

export type Command =
  | CommandV0
  | CommandV1
  | CommandV2
  | CommandV3
  | CommandV4
  | CommandV5;
