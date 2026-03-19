declare module "talon" {
  import type {
    TalonActions,
    TalonContextConstructor,
    TalonSettings,
  } from "@cursorless/cursorless-everywhere-talon-core";

  export const actions: TalonActions;
  export const settings: TalonSettings;
  export const Context: TalonContextConstructor;
}
