import type { CommandServerApi } from "@cursorless/common";
import * as sinon from "sinon";

export function mockPrePhraseGetVersion(
  commandServerApi: CommandServerApi,
  getVersion: () => Promise<string>,
) {
  sinon.replace(commandServerApi, "signals", {
    prePhrase: {
      getVersion,
    },
  });
}
