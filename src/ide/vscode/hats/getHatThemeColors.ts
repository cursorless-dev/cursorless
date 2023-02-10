import * as vscode from "vscode";
import { HatColor } from "../hatStyles.types";

interface OldDecorationColorSetting {
  dark: string;
  light: string;
  highContrast: string;
}

export default function getHatThemeColors(colorName: HatColor) {
  const oldStyleColorSetting = vscode.workspace
    .getConfiguration("cursorless.colors")
    .get<OldDecorationColorSetting>(colorName);

  const dark =
    oldStyleColorSetting?.dark ??
    vscode.workspace
      .getConfiguration("cursorless.colors.dark")
      .get<string>(colorName)!;

  const light =
    oldStyleColorSetting?.light ??
    vscode.workspace
      .getConfiguration("cursorless.colors.light")
      .get<string>(colorName)!;

  return { light, dark };
}
