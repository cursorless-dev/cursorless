import { HatStability, NormalizedIDE } from "@cursorless/common";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    ...ide.configuration.getOwnConfiguration("experimental"),
    hatStability,
  });
}
