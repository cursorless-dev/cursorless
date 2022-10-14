import { pickBy, values } from "lodash";
import { Graph } from "../../typings/Types";
import { Configuration, Disposable, IDE } from "../ide.types";
import SpyMessages, { Message } from "./SpyMessages";

export interface SpyIDERecordedValues {
  messages?: Message[];
}

export default class SpyIDE implements IDE {
  configuration: Configuration;
  messages: SpyMessages;

  constructor(private original: IDE) {
    this.configuration = original.configuration;
    this.messages = new SpyMessages(original.messages);
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    return this.original.disposeOnExit(...disposables);
  }

  getSpyValues(): SpyIDERecordedValues | undefined {
    const ret = {
      messages: this.messages.getSpyValues(),
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }
}

export interface SpyInfo extends Disposable {
  spy: SpyIDE;
}

export function injectSpyIde(graph: Graph): SpyInfo {
  const original = graph.ide;
  const spy = new SpyIDE(original);

  graph.ide = spy;

  return {
    spy,

    dispose() {
      graph.ide = original;
    },
  };
}
