declare module "talon" {
  import type {
    TalonActions,
    TalonContextConstructor,
    TalonSettings,
  } from "./talon";

  export const actions: TalonActions;
  export const settings: TalonSettings;
  export const Context: TalonContextConstructor;
}
