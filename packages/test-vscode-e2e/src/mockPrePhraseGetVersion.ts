import * as sinon from "sinon";
import type { CommandServerApi } from "@cursorless/lib-common";

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
