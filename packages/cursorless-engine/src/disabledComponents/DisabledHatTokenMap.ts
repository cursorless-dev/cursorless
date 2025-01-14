import type { HatTokenMap } from "@cursorless/common";

export class DisabledHatTokenMap implements HatTokenMap {
  async allocateHats() {
    // Do nothing
  }

  async getReadableMap() {
    return {
      getEntries() {
        return [];
      },
      getToken() {
        throw new Error("Hat map is disabled");
      },
    };
  }

  dispose() {
    // Do nothing
  }
}
