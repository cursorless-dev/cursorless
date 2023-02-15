import type { NormalizedIDE } from "../../../libs/common/ide/normalized/NormalizedIDE";
import type { HatStability } from "../../../libs/common/ide/types/HatStability";
import { getFixturePath } from "../getFixturePaths";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
    hatStability,
  });
}
