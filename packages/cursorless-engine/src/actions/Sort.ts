import { shuffle } from "lodash";
import { Target } from "../typings/target.types";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

abstract class SortBase implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  protected abstract sortTexts(texts: string[]): string[];

  async run(targets: Target[]): Promise<ActionReturnValue> {
    // First sort target by document order
    const sortedTargets = targets
      .slice()
      .sort((a, b) => a.contentRange.start.compareTo(b.contentRange.start));

    const { returnValue: unsortedTexts } = await this.actions.getText.run(
      sortedTargets,
      {
        showDecorations: false,
      },
    );

    const sortedTexts = this.sortTexts(unsortedTexts);

    return this.actions.replace.run(
      sortedTargets.map((target) => target.toDestination("to")),
      sortedTexts,
    );
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
