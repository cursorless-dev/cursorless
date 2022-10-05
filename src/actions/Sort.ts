import { shuffle } from "lodash";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { Action, ActionReturnValue } from "./actions.types";

export class Sort implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected sortTexts(texts: string[]) {
    return texts.sort(
      new Intl.Collator(undefined, {
        numeric: true,
        caseFirst: "upper",
      }).compare
    );
  }

  async run(targets: Target[][]): Promise<ActionReturnValue> {
    // First sort target by document order
    const sortedTargets = targets.map((t) =>
      t
        .slice()
        .sort((a, b) => a.contentRange.start.compareTo(b.contentRange.start))
    );

    const { returnValue: unsortedTexts } = await this.graph.actions.getText.run(
      sortedTargets,
      {
        showDecorations: false,
      }
    );

    const sortedTexts = this.sortTexts(unsortedTexts);

    return this.graph.actions.replace.run(sortedTargets, sortedTexts);
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
