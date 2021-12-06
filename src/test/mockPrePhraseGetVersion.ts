import * as sinon from "sinon";
import { Graph } from "../typings/Types";

export function mockPrePhraseGetVersion(
  graph: Graph,
  getVersion: () => Promise<string>
) {
  sinon.replaceGetter(graph, "commandServerApi", () => ({
    signals: {
      prePhrase: {
        getVersion,
      },
    },
  }));
}
