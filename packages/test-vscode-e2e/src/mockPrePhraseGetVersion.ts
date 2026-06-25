import { replace } from "sinon";
import type { CommandServerApi } from "@cursorless/lib-common";

export function mockPrePhraseGetVersion(
  commandServerApi: CommandServerApi,
  getVersion: () => Promise<string>,
) {
  replace(commandServerApi, "signals", {
    prePhrase: {
      getVersion,
    },
  });
}
