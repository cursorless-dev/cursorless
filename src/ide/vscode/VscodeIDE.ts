import { pull } from "lodash";
import { Graph } from "../../typings/Types";
import { Disposable, IDE } from "../ide.types";
import VscodeConfiguration from "./VscodeConfiguration";
import VscodeMessages from "./VscodeMessages";
import VscodeGlobalState from "./VscodeGlobalState";

export default class VscodeIDE implements IDE {
  configuration: VscodeConfiguration;
  globalState: VscodeGlobalState;
  messages: VscodeMessages;

  constructor(private graph: Graph) {
    this.configuration = new VscodeConfiguration(this);
    this.globalState = new VscodeGlobalState(graph.extensionContext);
    this.messages = new VscodeMessages();
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.graph.extensionContext.subscriptions.push(...disposables);

    return () =>
      pull(this.graph.extensionContext.subscriptions, ...disposables);
  }
}
