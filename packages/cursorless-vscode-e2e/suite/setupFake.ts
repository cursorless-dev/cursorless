import { HatStability, NormalizedIDE } from "@cursorless/common";
import { getFixturePath } from "../getFixturePaths";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
    hatStability,
  });
}
