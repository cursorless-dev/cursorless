import type { ActionDescriptor } from "./ActionDescriptor";
import type { CommandV6 } from "./CommandV6.types";
import type { CommandV7 } from "./CommandV7.types";
import type { Modifier } from "./PartialTargetDescriptor.types";
import type { CommandV0, CommandV1 } from "./legacy/CommandV0V1.types";
import type { CommandV2 } from "./legacy/CommandV2.types";
import type { CommandV3 } from "./legacy/CommandV3.types";
import type { CommandV4 } from "./legacy/CommandV4.types";
import type { CommandV5 } from "./legacy/CommandV5.types";

export type CommandComplete = Required<Omit<CommandLatest, "spokenForm">> &
  Pick<CommandLatest, "spokenForm">;
export const LATEST_VERSION = 7 as const;

export type CommandLatest = Command & {
  version: typeof LATEST_VERSION;
};

export type Command =
  | CommandV0
  | CommandV1
  | CommandV2
  | CommandV3
  | CommandV4
  | CommandV5
  | CommandV6
  | CommandV7;

export type CommandResponse = { returnValue: unknown } | { fallback: Fallback };

export type FallbackModifier = Modifier | { type: "containingTokenIfEmpty" };

export type Fallback =
  | { action: ActionDescriptor["name"]; modifiers: FallbackModifier[] }
  | { action: "insert"; modifiers: FallbackModifier[]; text: string }
  | { action: "callAsFunction"; modifiers: FallbackModifier[]; callee: string }
  | {
      action: "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter";
      modifiers: FallbackModifier[];
      left: string;
      right: string;
    };
