import { pull } from "lodash";
import { Graph } from "../../typings/Types";
import { Disposable, IDE } from "../ide.types";
import { VscodeConfiguration } from "./VscodeConfiguration";

export class VscodeIDE implements IDE {
  configuration: VscodeConfiguration;

  constructor(private graph: Graph) {
    this.configuration = new VscodeConfiguration(graph);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.graph.extensionContext.subscriptions.push(...disposables);

    return () =>
      pull(this.graph.extensionContext.subscriptions, ...disposables);
  }
}
