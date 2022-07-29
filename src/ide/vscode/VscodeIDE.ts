import { Graph } from "../../typings/Types";
import { Disposable, IDE } from "../ide.types";
import { VscodeConfiguration } from "./VscodeConfiguration";

export class VscodeIDE implements IDE {
  configuration: VscodeConfiguration;

  constructor(private graph: Graph) {
    this.configuration = new VscodeConfiguration(graph);
  }

  disposeOnExit(disposable: Disposable): void {
    this.graph.extensionContext.subscriptions.push(disposable);
  }
}
