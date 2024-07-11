import type { CommandServerApi } from "@cursorless/common";

const DisabledCommandServerApi: CommandServerApi = {
  getFocusedElementType() {
    return Promise.resolve(undefined);
  },

  signals: {
    prePhrase: {
      getVersion() {
        return Promise.resolve(null);
      },
    },
  },
};

export function createDisabledCommandServerApi() {
  return DisabledCommandServerApi;
}
