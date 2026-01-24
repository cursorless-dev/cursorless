import type { MatchedText, TextEditor } from "@cursorless/common";
import { Range, matchText } from "@cursorless/common";
import { PlainTarget } from "../processTargets/targets";
import type { SelectionWithEditor } from "../typings/Types";
import type { Destination, Target } from "../typings/target.types";
import { runForEachEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";

const REGEX = /-?[\d_]+(\.[\d_]+)?/g;

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
        const selections = await this.runOnEditor(editor, targets);
        thatSelections.push(...selections);
      },
    );

    return { thatSelections };
  }

  private async runOnEditor(
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
    ? updateFloat(isIncrement, text)
    : updateInteger(isIncrement, text);
}

function updateInteger(isIncrement: boolean, text: string): string {
  const textWithoutUnderscores = text.replaceAll("_", "");
  const original = parseInt(textWithoutUnderscores);
  const diff = 1;
  const value = original + (isIncrement ? diff : -diff);
  return formatNumber(value, text, textWithoutUnderscores);
}

function updateFloat(isIncrement: boolean, text: string): string {
  const textWithoutUnderscores = text.replaceAll("_", "");
  const original = parseFloat(textWithoutUnderscores);
  const isPercentage = Math.abs(original) <= 1.0;
  const diff = isPercentage ? 0.1 : 1;
  const updated = original + (isIncrement ? diff : -diff);
  // Remove precision problems that would add a lot of extra digits
  const value = parseFloat(updated.toPrecision(15)) / 1;
  const decimalPlaces = textWithoutUnderscores.split(".")[1]?.length;
  return formatNumber(value, text, textWithoutUnderscores, decimalPlaces);
}

function formatNumber(
  value: number,
  text: string,
  textWithoutUnderscores: string,
  decimalPlaces?: number,
): string {
  const result = (() => {
    if (hasLeadingZeros(textWithoutUnderscores)) {
      return formatNumberWithLeadingZeros(
        value,
        textWithoutUnderscores,
        decimalPlaces,
      );
    }

    return decimalPlaces != null
      ? value.toFixed(decimalPlaces)
      : value.toString();
  })();

  return formatNumberWithUnderscores(text, result);
}

function formatNumberWithLeadingZeros(
  value: number,
  text: string,
  decimalPlaces?: number,
): string {
  const sign = value < 0 ? "-" : "";
  const absValue = Math.abs(value);
  const integerPartLength = getIntegerPartLength(text);
  const integerPart = Math.floor(absValue)
    .toString()
    .padStart(integerPartLength, "0");

  if (decimalPlaces != null) {
    const fractionPart = (absValue - Math.floor(absValue))
      .toFixed(decimalPlaces)
      // Remove "0."
      .slice(2);
    return `${sign}${integerPart}.${fractionPart}`;
  }

  return `${sign}${integerPart}`;
}

// Reinsert underscores at original positions
function formatNumberWithUnderscores(
  original: string,
  updated: string,
): string {
  const underscoreMatches = Array.from(original.matchAll(/_/g));

  if (underscoreMatches.length === 0) {
    return updated;
  }

  let resultWithUnderscores = updated;
  const offset = (updated[0] === "-" ? 1 : 0) - (original[0] === "-" ? 1 : 0);

  for (const match of underscoreMatches) {
    const index = match.index + offset;
    if (index < resultWithUnderscores.length) {
      resultWithUnderscores =
        resultWithUnderscores.slice(0, index) +
        "_" +
        resultWithUnderscores.slice(index);
    }
  }

  return resultWithUnderscores;
}

function hasLeadingZeros(text: string): boolean {
  return /^-?0\d/.test(text);
}

function getIntegerPartLength(text: string): number {
  return /^-?(\d+)/.exec(text)![1].length;
}
