import {
  EditorGeneralizedRange,
  FlashDescriptor,
  FlashStyle,
  groupBy,
  sleep,
} from "@cursorless/common";
import { workspace } from "vscode";
import VscodeHighlights from "./VscodeHighlights";
import { VscodeIDE } from "./VscodeIDE";

export default class VscodeFlashHandler {
  constructor(private ide: VscodeIDE, private highlights: VscodeHighlights) {}

  async flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    const flashMap = groupBy(flashDescriptors, ({ style }) => style);

    await Promise.all(
      Array.from(flashMap.entries()).map(([style, descriptors]) =>
        this.setDecorationRanges(style, descriptors),
      ),
    );

    await sleep(getPendingEditDecorationTime());

    await Promise.all(
      Array.from(flashMap.keys()).map((style) =>
        this.setDecorationRanges(style, []),
      ),
    );
  }

  private async setDecorationRanges(
    style: FlashStyle,
    ranges: EditorGeneralizedRange[],
  ): Promise<void> {
    const editorRangeMap = groupBy(ranges, ({ editor }) => editor.id);

    this.ide.visibleTextEditors.forEach((editor) => {
      const ranges = (editorRangeMap.get(editor.id) ?? []).map(
        ({ range }) => range,
      );
      this.highlights.setHighlightRanges(style, editor, ranges);
    });
  }
}

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;
