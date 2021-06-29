import * as vscode from "vscode";
import { join } from "path";
import { COLORS } from "./constants";
import { SymbolColor } from "./constants";
import { readFileSync } from "fs";
import { DecorationColorSetting } from "./Types";

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
    const iconWidth = "0.7em";
    const iconPath = join(__dirname, "..", "images", "curved-hat.svg");
    const rawSvg = readFileSync(iconPath, "utf8");

    this.decorations = COLORS.map((color) => {
      var colorSetting = vscode.workspace
        .getConfiguration("cursorless")
        .get<DecorationColorSetting>(`${color}Border`)!;

      return {
        name: color,
        decoration: vscode.window.createTextEditorDecorationType({
          rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
          light: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                rawSvg,
                colorSetting.light
              ),
            },
          },
          dark: {
            after: {
              contentIconPath: this.constructColoredSvgDataUri(
                rawSvg,
                colorSetting.dark
              ),
            },
          },
          after: {
            margin: `0 0 0 -${iconWidth}`,
            width: iconWidth,
          },
        }),
      };
    });

    this.decorationMap = Object.fromEntries(
      this.decorations.map(({ name, decoration }) => [name, decoration])
    );
  }

  private constructColoredSvgDataUri(rawSvg: string, color: string) {
    const svg = rawSvg
      .replace(/fill="[^"]+"/, `fill="${color}"`)
      .replace(/fill:[^;]+;/, `fill:${color};`);

    const encoded = Buffer.from(svg).toString("base64");

    return vscode.Uri.parse(`data:image/svg+xml;base64,${encoded}`);
  }
}
