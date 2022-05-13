import { CommandV0, CommandV1 } from "../upgradeV1ToV2/commandV1.types";

export function upgradeV0ToV1(command: CommandV0): CommandV1 {
  return { ...command, version: 1 };
}
