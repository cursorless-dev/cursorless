import { sleep } from "@cursorless/common";
import { workspace } from "vscode";
import { FlashDescriptor } from "../../libs/common/ide/types/FlashDescriptor";
import { groupBy } from "../../util/itertools";
import VscodeHighlights from "./VscodeHighlights";

export default class VscodeFlashHandler {
  constructor(private highlights: VscodeHighlights) {}

  async flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    const flashMap = groupBy(flashDescriptors, ({ style }) => style);

    await Promise.all(
      Array.from(flashMap.entries()).map(([style, descriptors]) =>
        this.highlights.setHighlightRanges(style, descriptors),
      ),
    );

    await sleep(getPendingEditDecorationTime());

    await Promise.all(
      Array.from(flashMap.keys()).map((style) =>
        this.highlights.setHighlightRanges(style, []),
      ),
    );
  }
}

const getPendingEditDecorationTime = () =>
  workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;
