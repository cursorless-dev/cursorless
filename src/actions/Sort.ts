import { shuffle } from "lodash";
import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../typings/Types";

export class Sort implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected sortTexts(texts: string[]) {
    return texts.sort();
  }

  async run(targets: TypedSelection[][]): Promise<ActionReturnValue> {
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
