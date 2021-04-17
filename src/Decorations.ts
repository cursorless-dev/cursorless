import * as vscode from "vscode";
import { COLORS } from "./constants";
import { SymbolColor } from "./constants";

export type DecorationMap = {
  [k in SymbolColor]?: vscode.TextEditorDecorationType;
};

export interface NamedDecoration {
  name: SymbolColor;
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
        borderColor: new vscode.ThemeColor(`cursorless.${color}Border`),
        borderWidth: "2px 0px 0px 0px",
        borderRadius: "4px",
        backgroundColor: new vscode.ThemeColor(`cursorless.${color}Background`),
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      }),
    }));

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }
}
