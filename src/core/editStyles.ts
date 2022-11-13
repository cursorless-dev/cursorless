import {
  DecorationRangeBehavior,
  DecorationRenderOptions,
  TextEditorDecorationType,
  ThemeColor,
  window,
  workspace,
} from "vscode";
import Position from "../libs/common/ide/Position";
import { Range } from "../libs/common/ide";
import { EditableTextEditor } from "../libs/common/ide/types/TextEditor";
import sleep from "../libs/common/util/sleep";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import isTesting from "../testUtil/isTesting";
import { Target } from "../typings/target.types";
import { Graph, RangeWithEditor } from "../typings/Types";
import {
  getContentRange,
  runForEachEditor,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";

export class EditStyle {
  name: EditStyleThemeColorName;
  token: TextEditorDecorationType;
  line: TextEditorDecorationType;

  constructor(colorName: EditStyleThemeColorName) {
    const options: DecorationRenderOptions = {
      backgroundColor: new ThemeColor(`cursorless.${colorName}`),
      rangeBehavior: DecorationRangeBehavior.ClosedClosed,
    };
    this.name = colorName;
    this.token = window.createTextEditorDecorationType(options);
    this.line = window.createTextEditorDecorationType({
      ...options,
      isWholeLine: true,
    });
  }

  getDecoration(isToken: boolean) {
    return isToken ? this.token : this.line;
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

export interface TestDecoration {
  name: EditStyleThemeColorName;
  type: "token" | "line";
  start: Position;
  end: Position;
}

export class EditStyles implements Record<EditStyleName, EditStyle> {
  pendingDelete!: EditStyle;
  referenced!: EditStyle;
  pendingModification0!: EditStyle;
  pendingModification1!: EditStyle;
  justAdded!: EditStyle;
  highlight0!: EditStyle;
  highlight1!: EditStyle;
  testDecorations: TestDecoration[] = [];

  constructor(private graph: Graph) {
    EDIT_STYLE_NAMES.forEach((editStyleName) => {
      this[editStyleName] = new EditStyle(`${editStyleName}Background`);
    });

    ide().disposeOnExit(this);
  }

  async displayPendingEditDecorations(
    targets: Target[],
    style: EditStyle,
    getRange: (target: Target) => Range | undefined = getContentRange,
  ) {
    await this.setDecorations(targets, style, getRange);

    await decorationSleep();

    this.clearDecorations(style);
  }

  displayPendingEditDecorationsForTargets(
    targets: Target[],
    style: EditStyle,
    isToken: boolean,
  ) {
    return this.displayPendingEditDecorationsForRanges(
      targets.map(({ editor, contentRange }) => ({
        editor,
        range: contentRange,
      })),
      style,
      isToken,
    );
  }

  async displayPendingEditDecorationsForRanges(
    ranges: RangeWithEditor[],
    style: EditStyle,
    isToken: boolean,
  ) {
    await runForEachEditor(
      ranges,
      (range) => range.editor,
      async (editor, ranges) => {
        this.setEditorDecorations(
          ide().getEditableTextEditor(editor),
          style,
          isToken,
          ranges.map((range) => range.range),
        );
      },
    );

    await decorationSleep();

    await runForEachEditor(
      ranges,
      (range) => range.editor,
      async (editor) => {
        ide()
          .getEditableTextEditor(editor)
          .setDecorations(style.getDecoration(isToken), []);
      },
    );
  }

  setDecorations(
    targets: Target[],
    style: EditStyle,
    getRange: (target: Target) => Range | undefined = getContentRange,
  ) {
    return runOnTargetsForEachEditor(targets, async (editor, targets) => {
      this.setEditorDecorations(
        ide().getEditableTextEditor(editor),
        style,
        true,
        targets
          .filter((target) => !target.isLine)
          .map(getRange)
          .filter((range): range is Range => !!range),
      );
      this.setEditorDecorations(
        ide().getEditableTextEditor(editor),
        style,
        false,
        targets
          .filter((target) => target.isLine)
          .map(getRange)
          .filter((range): range is Range => !!range),
      );
    });
  }

  clearDecorations(style: EditStyle) {
    window.visibleTextEditors.map((editor) => {
      editor.setDecorations(style.token, []);
      editor.setDecorations(style.line, []);
    });
  }

  private setEditorDecorations(
    editor: EditableTextEditor,
    style: EditStyle,
    isToken: boolean,
    ranges: Range[],
  ) {
    if (this.graph.testCaseRecorder.isActive() || isTesting()) {
      ranges.forEach((range) => {
        this.testDecorations.push({
          name: style.name,
          type: isToken ? "token" : "line",
          start: range.start,
          end: range.end,
        });
      });
      if (isTesting()) {
        return;
      }
    }
    editor.setDecorations(style.getDecoration(isToken), ranges);
  }

  dispose() {
    EDIT_STYLE_NAMES.forEach((editStyleName) => {
      this[editStyleName].dispose();
    });
  }
}

function decorationSleep() {
  if (isTesting()) {
    return;
  }

  return sleep(getPendingEditDecorationTime());
}

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;
