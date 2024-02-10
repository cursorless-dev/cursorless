import { CommandServerApi } from "./types/CommandServerApi";

export function getFakeCommandServerApi(): CommandServerApi {
  return {
    getFocusedElementType: () => "textEditor",

    signals: {
      prePhrase: {
        getVersion: async () => null,
      },
    },
  };
}
