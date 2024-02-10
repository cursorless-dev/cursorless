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
    private increment: boolean,
  ) {
    this.run = this.run.bind(this);
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
        replaceWith.push(updateNumber(this.increment, match.text));
      }
    }

    const { thatSelections } = await this.actions.replace.run(
      destinations,
      replaceWith,
    );

    return thatSelections!;
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

function updateNumber(increment: boolean, text: string): string {
  return text.includes(".")
    ? updateFloat(increment, text).toString()
    : updateInteger(increment, text).toString();
}

function updateInteger(increment: boolean, text: string): number {
  const original = parseInt(text);
  const diff = 1;
  return original + (increment ? diff : -diff);
}

function updateFloat(increment: boolean, text: string): number {
  const original = parseFloat(text);
  const isPercentage = Math.abs(original) <= 1.0;
  const diff = isPercentage ? 0.1 : 1;
  const updated = original + (increment ? diff : -diff);
  // Remove precision problems that would add a lot of extra digits
  return parseFloat(updated.toPrecision(15)) / 1;
}
