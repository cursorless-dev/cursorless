import {
  CommandV0,
  CommandV1,
} from "../../commandRunner/typings/legacy/CommandV0V1.types";

export function upgradeV0ToV1(command: CommandV0): CommandV1 {
  return { ...command, version: 1 };
}
