import { workspace } from "vscode";
import type {
  EditorGeneralizedRange,
  FlashDescriptor,
  FlashStyle,
} from "@cursorless/lib-common";
import { groupBy, sleep } from "@cursorless/lib-common";
import type { VscodeHighlights } from "./VscodeHighlights";
import type { VscodeIDE } from "./VscodeIDE";

export class VscodeFlashHandler {
  constructor(
    private ide: VscodeIDE,
    private highlights: VscodeHighlights,
  ) {}

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

  private setDecorationRanges(
    style: FlashStyle,
    ranges: EditorGeneralizedRange[],
  ): void {
    const editorRangeMap = groupBy(ranges, ({ editor }) => editor.id);

    for (const editor of this.ide.visibleTextEditors) {
      const ranges = (editorRangeMap.get(editor.id) ?? []).map(
        ({ range }) => range,
      );
      void this.highlights.setHighlightRanges(style, editor, ranges);
    }
  }
}

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;
