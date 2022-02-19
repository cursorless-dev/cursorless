import {
  TextEditorDecorationType,
  ThemeColor,
  DecorationRangeBehavior,
  window,
  DecorationRenderOptions,
} from "vscode";
import { Graph } from "../typings/Types";

export class EditStyle {
  token: TextEditorDecorationType;
  line: TextEditorDecorationType;

  constructor(colorName: EditStyleThemeColorName) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${colorName}`),
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };
    this.token = window.createTextEditorDecorationType(options);
    this.line = window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }

  dispose() {
    this.token.dispose();
    this.line.dispose();
  }
}

const EDIT_STYLE_NAMES = [
  "pendingDelete",
  "referenced",
  "pendingModification0",
  "pendingModification1",
  "justAdded",
  "highlight0",
  "highlight1",
] as const;

export type EditStyleName = typeof EDIT_STYLE_NAMES[number];
type EditStyleThemeColorName = `${EditStyleName}Background`;

export class EditStyles implements Record<EditStyleName, EditStyle> {
  pendingDelete!: EditStyle;
  referenced!: EditStyle;
  pendingModification0!: EditStyle;
  pendingModification1!: EditStyle;
  justAdded!: EditStyle;
  highlight0!: EditStyle;
  highlight1!: EditStyle;

  constructor(graph: Graph) {
    EDIT_STYLE_NAMES.forEach((editStyleName) => {
      this[editStyleName] = new EditStyle(`${editStyleName}Background`);
    });

    graph.extensionContext.subscriptions.push(this);
  }

  dispose() {
    EDIT_STYLE_NAMES.forEach((editStyleName) => {
      this[editStyleName].dispose();
    });
  }
}
