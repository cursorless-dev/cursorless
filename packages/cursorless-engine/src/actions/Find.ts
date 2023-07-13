import { showWarning } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { ensureSingleTarget } from "../util/targetUtils";
import { Actions } from "./Actions";
import { SimpleAction, ActionReturnValue } from "./actions.types";

export class FindInWorkspace implements SimpleAction {
  constructor(private actions: Actions) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    ensureSingleTarget(targets);

    const { returnValue, thatTargets } = await this.actions.getText.run(
      targets,
    );
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

    await ide().findInWorkspace(query);

    return { thatTargets };
  }
}
