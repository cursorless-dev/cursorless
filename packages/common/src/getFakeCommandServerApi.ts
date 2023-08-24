import type { CommandServerApi } from "./types/CommandServerApi";

export function getFakeCommandServerApi(): CommandServerApi {
  return {
    signals: {
      prePhrase: {
        getVersion: async () => null,
      },
    },
  };
}
