import { shuffle } from "lodash";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Graph";
import { Action, ActionReturnValue } from "./actions.types";

abstract class SortBase implements Action {
  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected abstract sortTexts(texts: string[]): string[];

  async run(targets: Target[][]): Promise<ActionReturnValue> {
    // First sort target by document order
    const sortedTargets = targets.map((t) =>
      t
        .slice()
        .sort((a, b) => a.contentRange.start.compareTo(b.contentRange.start)),
    );

    const { returnValue: unsortedTexts } = await this.graph.actions.getText.run(
      sortedTargets,
      {
        showDecorations: false,
      },
    );

    const sortedTexts = this.sortTexts(unsortedTexts);

    return this.graph.actions.replace.run(sortedTargets, sortedTexts);
  }
}

export class Sort extends SortBase {
  private collator = new Intl.Collator(undefined, {
    numeric: true,
    caseFirst: "upper",
  });

  protected sortTexts(texts: string[]) {
    return texts.sort(this.collator.compare);
  }
}

export class Reverse extends SortBase {
  protected sortTexts(texts: string[]) {
    return texts.reverse();
  }
}

export class Random extends SortBase {
  protected sortTexts(texts: string[]) {
    return shuffle(texts);
  }
}
