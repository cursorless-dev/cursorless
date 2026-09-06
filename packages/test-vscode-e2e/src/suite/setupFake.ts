import type { HatStability, NormalizedIDE } from "@cursorless/lib-common";

export function setupFake(ide: NormalizedIDE, hatStability: HatStability) {
  ide.configuration.mockConfiguration("experimental", {
    ...ide.configuration.getOwnConfiguration("experimental"),
    hatStability,
  });
}
