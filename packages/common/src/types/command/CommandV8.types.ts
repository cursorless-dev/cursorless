import type { CommandV7 } from "./CommandV7.types";

export interface CommandV8 extends Omit<CommandV7, "version"> {
  /**
   * The version number of the command API
   */
  version: 8;
}
