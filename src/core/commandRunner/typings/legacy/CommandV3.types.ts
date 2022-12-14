import type { CommandV4 } from "../CommandV4.types";

export type CommandV3 = Omit<CommandV4, "version"> & {
  version: 3;
};
