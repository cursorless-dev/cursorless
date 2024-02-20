import { Range, TextEditor } from "@cursorless/common";
import { PlainTarget } from "../processTargets/targets";
import { SelectionWithEditor } from "../typings/Types";
import { Destination, Target } from "../typings/target.types";
import { MatchedText, matchText } from "../util/regex";
import { runForEachEditor } from "../util/targetUtils";
import { Actions } from "./Actions";
import { ActionReturnValue } from "./actions.types";

const REGEX = /-?\d+(\.\d+)?/g;

class IncrementDecrement {
  constructor(
    private actions: Actions,
    private isIncrement: boolean,
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const thatSelections: SelectionWithEditor[] = [];

    await runForEachEditor(
      targets,
      (target) => target.editor,
      async (editor, targets) => {
        const selections = await this.runForEachEditor(editor, targets);
        thatSelections.push(...selections);
      },
    );

    return { thatSelections };
  }

  private async runForEachEditor(
    editor: TextEditor,
    targets: Target[],
  ): Promise<SelectionWithEditor[]> {
    const { document } = editor;
    const destinations: Destination[] = [];
    const replaceWith: string[] = [];

    for (const target of targets) {
      const offset = document.offsetAt(target.contentRange.start);
      const text = target.contentText;
      const matches = matchText(text, REGEX);

      for (const match of matches) {
        destinations.push(createDestination(editor, offset, match));
        replaceWith.push(updateNumber(this.isIncrement, match.text));
      }
    }

    const { thatSelections } = await this.actions.replace.run(
      destinations,
      replaceWith,
    );

    return thatSelections!;
  }
}

export class Increment extends IncrementDecrement {
  constructor(actions: Actions) {
    super(actions, true);
  }
}

export class Decrement extends IncrementDecrement {
  constructor(actions: Actions) {
    super(actions, false);
  }
}

function createDestination(
  editor: TextEditor,
  offset: number,
  match: MatchedText,
): Destination {
  const target = new PlainTarget({
    editor,
    isReversed: false,
    contentRange: new Range(
      editor.document.positionAt(offset + match.index),
      editor.document.positionAt(offset + match.index + match.text.length),
    ),
  });
  return target.toDestination("to");
}

function updateNumber(isIncrement: boolean, text: string): string {
  return text.includes(".")
    ? updateFloat(isIncrement, text).toString()
    : updateInteger(isIncrement, text).toString();
}

function updateInteger(isIncrement: boolean, text: string): number {
  const original = parseInt(text);
  const diff = 1;
  return original + (isIncrement ? diff : -diff);
}

function updateFloat(isIncrement: boolean, text: string): number {
  const original = parseFloat(text);
  const isPercentage = Math.abs(original) <= 1.0;
  const diff = isPercentage ? 0.1 : 1;
  const updated = original + (isIncrement ? diff : -diff);
  // Remove precision problems that would add a lot of extra digits
  return parseFloat(updated.toPrecision(15)) / 1;
}
