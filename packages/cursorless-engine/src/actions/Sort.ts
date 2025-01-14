import { showWarning } from "@cursorless/common";
import { shuffle } from "lodash-es";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import type { Actions } from "./Actions";
import type { ActionReturnValue, SimpleAction } from "./actions.types";

abstract class SortBase implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  protected abstract sortTexts(texts: string[]): string[];

  async run(targets: Target[]): Promise<ActionReturnValue> {
    if (targets.length < 2) {
      void showWarning(
        ide().messages,
        "tooFewTargets",
        'This action works on multiple targets, e.g. "sort every line block" instead of "sort block".',
      );
    }

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

    const { thatSelections } = await this.actions.replace.run(
      sortedTargets.map((target) => target.toDestination("to")),
      sortedTexts,
    );

    return { thatSelections };
  }
}

export class Sort extends SortBase {
  protected sortTexts(texts: string[]) {
    return texts.sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        caseFirst: "upper",
      }),
    );
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
