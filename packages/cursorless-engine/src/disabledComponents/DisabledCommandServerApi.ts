import type { CommandServerApi } from "@cursorless/common";

export class DisabledCommandServerApi implements CommandServerApi {
  getFocusedElementType() {
    return Promise.resolve(undefined);
  }

  readonly signals = {
    prePhrase: {
      getVersion() {
        return Promise.resolve(null);
      },
    },
  };
}
