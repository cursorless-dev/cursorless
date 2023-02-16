import * as sinon from "sinon";
import type { Graph } from "../../libs/cursorless-engine/typings/Types";

export function mockPrePhraseGetVersion(
  graph: Graph,
  getVersion: () => Promise<string>,
) {
  sinon.replaceGetter(graph, "commandServerApi", () => ({
    signals: {
      prePhrase: {
        getVersion,
      },
    },
  }));
}
