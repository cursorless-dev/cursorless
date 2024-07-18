import type { CommandV6 } from "./CommandV6.types";

export interface CommandV7 extends Omit<CommandV6, "version"> {
  /**
   * The version number of the command API
   */
  version: 7;
}
