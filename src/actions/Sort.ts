import { shuffle } from "lodash";
import type { Target } from "../typings/target.types";
import type { Graph } from "../typings/Types";
import type { Action, ActionReturnValue } from "./actions.types";

export class Sort implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected sortTexts(texts: string[]) {
    return texts.sort();
  }

  async run(targets: Target[][]): Promise<ActionReturnValue> {
    const { returnValue: unsortedTexts } = await this.graph.actions.getText.run(
      targets,
      {
        showDecorations: false,
      }
    );

    const sortedTexts = this.sortTexts(unsortedTexts);

    return this.graph.actions.replace.run(targets, sortedTexts);
  }
}

export class Reverse extends Sort {
  protected sortTexts(texts: string[]) {
    return texts.reverse();
  }
}

export class Random extends Sort {
  protected sortTexts(texts: string[]) {
    return shuffle(texts);
  }
}
