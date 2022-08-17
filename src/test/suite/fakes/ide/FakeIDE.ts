import { pull } from "lodash";
import { Disposable, IDE } from "../../../../ide/ide.types";
import { Graph } from "../../../../typings/Types";
import { FakeConfiguration } from "./FakeConfiguration";

export class FakeIDE implements IDE {
  configuration: FakeConfiguration;
  private disposables: Disposable[] = [];

  constructor(graph: Graph) {
    this.configuration = new FakeConfiguration(graph);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  exit(): void {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
