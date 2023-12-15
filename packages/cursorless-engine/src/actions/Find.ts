import { showWarning } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

abstract class Find implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const { returnValue, thatTargets } =
      await this.actions.getText.run(targets);
    const [text] = returnValue as [string];

    let query: string;
    if (text.length > 200) {
      query = text.substring(0, 200);
      showWarning(
        ide().messages,
        "truncatedSearchText",
        "Search text is longer than 200 characters; truncating",
      );
    } else {
      query = text;
    }

    await this.find(query);

    return { thatTargets };
  }

  protected abstract find(query: string): Promise<void>;
}

export class FindInDocument extends Find {
  protected find(query: string): Promise<void> {
    return ide().findInDocument(query);
  }
}

export class FindInWorkspace extends Find {
  protected find(query: string): Promise<void> {
    return ide().findInWorkspace(query);
  }
}
