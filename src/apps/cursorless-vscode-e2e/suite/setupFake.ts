import type NormalizedIDE from "../../../libs/common/ide/normalized/NormalizedIDE";
import type { HatComparisonPolicy } from "../../../libs/common/ide/types/HatStability";
import { getFixturePath } from "../getFixturePaths";

export function setupFake(
  ide: NormalizedIDE,
  hatComparisonPolicy: HatComparisonPolicy,
) {
  ide.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
    hatStability: {
      keepingPolicy: hatComparisonPolicy,
      stealingPolicy: hatComparisonPolicy,
    },
  });
}
