import {
  getFixturePath,
  HatStability,
  NormalizedIDE,
} from "@cursorless/common";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    snippetsDir: getFixturePath("cursorless-snippets"),
    hatStability,
  });
}
