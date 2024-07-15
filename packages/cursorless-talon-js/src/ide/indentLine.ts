import { Edit, Range } from "@cursorless/common";
import type { TalonJsEditor } from "./TalonJsEditor";
import type { TalonJsIDE } from "./TalonJsIDE";
import { performEdits } from "./performEdits";

export async function indentLine(
  ide: TalonJsIDE,
  editor: TalonJsEditor,
  ranges: Range[],
): Promise<void> {
  const indent = getIndent(editor);

  await performEdits(
    ide,
    editor,
    ranges.map((range): Edit => {
      const line = editor.document.lineAt(range.start);
      return {
        range: line.range.start.toEmptyRange(),
        text: indent,
      };
    }),
  );
}

export async function outdentLine(
  ide: TalonJsIDE,
  editor: TalonJsEditor,
  ranges: Range[],
): Promise<void> {
  const regex = getRegex(editor);

  await performEdits(
    ide,
    editor,
    ranges.map((range): Edit => {
      const line = editor.document.lineAt(range.start);
      const match = line.text.match(regex);
      const { start } = line.range;
      const end = start.translate(undefined, match?.[0].length);
      return {
        range: new Range(start, end),
        text: "",
      };
    }),
  );
}

function getIndent(editor: TalonJsEditor) {
  if (editor.options.insertSpaces) {
    const tabSize = (editor.options.tabSize ?? 4) as number;
    return " ".repeat(tabSize);
  }
  return "\t";
}

function getRegex(editor: TalonJsEditor) {
  if (editor.options.insertSpaces) {
    const tabSize = (editor.options.tabSize ?? 4) as number;
    return new RegExp(`^[ ]{1, ${tabSize}}`);
  }
  return /^\t/;
}
