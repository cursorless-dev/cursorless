declare module "talon" {
  import type {
    TalonActions,
    TalonContextConstructor,
    TalonSettings,
  } from "@cursorless/lib-talonjs-core";

  export const actions: TalonActions;
  export const settings: TalonSettings;
  export const Context: TalonContextConstructor;
}
