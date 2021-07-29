import {
  Action,
  ActionReturnValue,
  ActionPreferences,
  Graph,
  TypedSelection,
} from "../Types";

export class Sort implements Action {
  targetPreferences: ActionPreferences[] = [{ insideOutsideType: "inside" }];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  protected sortTexts(texts: string[]) {
    return texts.sort();
  }

  async run(targets: TypedSelection[][]): Promise<ActionReturnValue> {
    const { returnValue } = await this.graph.actions.getText.run(targets, {
      showDecorations: false,
    });

    const texts = this.sortTexts(returnValue);

    const { thatMark } = await this.graph.actions.replaceWithText.run(
      targets,
      texts
    );

    return { returnValue: null, thatMark };
  }
}

export class Reverse extends Sort {
  protected sortTexts(texts: string[]) {
    return texts.reverse();
  }
}
