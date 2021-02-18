import * as vscode from "vscode";
import { COLORS } from "./extension";

export interface DecorationMap {
  [k: string]: vscode.TextEditorDecorationType;
}

export interface NamedDecoration {
  name: string;
  decoration: vscode.TextEditorDecorationType;
}

export default class Decorations {
  decorations: NamedDecoration[];
  decorationMap: DecorationMap;

  constructor() {
    this.decorations = COLORS.map((color) => ({
      name: color,
      decoration: vscode.window.createTextEditorDecorationType({
        borderStyle: "solid",
        borderColor: new vscode.ThemeColor(
          `decorativeNavigation.${color}Border`
        ),
        borderWidth: "1px 0px 0px 0px",
      }),
    }));

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }
}
