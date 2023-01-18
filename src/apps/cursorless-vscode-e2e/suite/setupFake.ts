import { HatStability } from "@cursorless/common";
import type NormalizedIDE from "../../../libs/common/ide/normalized/NormalizedIDE";
import { getFixturePath } from "../getFixturePaths";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
    hatStability,
  });
}
