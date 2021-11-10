import * as sinon from "sinon";
import { Signal } from "../util/getExtensionApi";
import { Graph } from "../typings/Types";

export function mockPrePhraseGetVersion(
  graph: Graph,
  getVersion: () => Promise<string>
) {
  sinon.replaceGetter(graph, "commandServerApi", () => ({
    signals: {
      getNamedSignal(name: string) {
        return {} as Signal;
      },
      prePhrase: {
        getVersion,
      } as Signal,
    },
  }));
}
