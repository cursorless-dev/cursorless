import { pull } from "lodash";
import { Disposable, IDE } from "../../../../ide/ide.types";
import { Graph } from "../../../../typings/Types";
import FakeConfiguration from "./FakeConfiguration";
import FakeGlobalState from "./FakeGlobalState";
import FakeMessages from "./FakeMessages";

export default class FakeIDE implements IDE {
  configuration: FakeConfiguration;
  messages: FakeMessages;
  globalState: FakeGlobalState;
  private disposables: Disposable[] = [];

  constructor(graph: Graph) {
    this.configuration = new FakeConfiguration(graph);
    this.messages = new FakeMessages();
    this.globalState = new FakeGlobalState();
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}

export interface FakeInfo extends Disposable {
  fake: FakeIDE;
}

export function injectFakeIde(graph: Graph): FakeInfo {
  const original = graph.ide;
  const fake = new FakeIDE(graph);

  graph.ide = fake;

  return {
    fake,

    dispose() {
      graph.ide = original;
    },
  };
}
