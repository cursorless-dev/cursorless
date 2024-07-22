import type {
  TalonActions,
  TalonContext,
  TalonContextActions,
  TalonSettings,
} from "@cursorless/cursorless-everywhere-talon-core";

declare module "talon" {
  const actions: TalonActions;
  const settings: TalonSettings;

  class Context implements TalonContext {
    matches: string;
    tags: string[];
    settings: Record<string, string | number | boolean>;
    lists: Record<string, Record<string, string> | string[]>;
    action_class(name: "user", actions: TalonContextActions): void;
  }
}
