import type { HatTokenMap } from "@cursorless/lib-common";

export class DisabledHatTokenMap implements HatTokenMap {
  async allocateHats() {
    // Do nothing
  }

  getReadableMap() {
    return Promise.resolve({
      getEntries() {
        return [];
      },
      getToken() {
        throw new Error("Hat map is disabled");
      },
    });
  }

  dispose() {
    // Do nothing
  }
}
