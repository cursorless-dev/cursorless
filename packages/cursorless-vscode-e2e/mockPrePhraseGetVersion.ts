import { CommandServerApi } from "@cursorless/common";
import * as sinon from "sinon";

export function mockPrePhraseGetVersion(
  commandServerApi: CommandServerApi,
  getVersion: () => Promise<string>,
) {
  sinon.replaceGetter(commandServerApi, "signals", () => ({
    prePhrase: {
      getVersion,
    },
  }));
}
