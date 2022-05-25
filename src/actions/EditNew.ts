import { zip } from "lodash";
import { commands, Range, TextEditor } from "vscode";
import {
  callFunctionAndUpdateRanges,
  performEditsAndUpdateRanges,
} from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { selectionFromRange } from "../util/selectionUtils";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class EditNew implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const richTargets: RichTarget[] = targets.map((target, index) => {
      const context = target.getEditNewContext(this.isBefore);

      const common = {
        target,
        index,
        targetRange: target.thatTarget.contentRange,
        cursorRange: getEditRange(
          editor,
          target.contentRange,
          false,
          this.isBefore
        ),
      };
      switch (context.type) {
        case "command":
          return {
            ...common,
            type: "command",
            command: context.command,
          };
        case "delimiter":
          const isLine = context.delimiter.includes("\n");
          return {
            ...common,
            type: "delimiter",
            delimiter: context.delimiter,
            isLine,
            cursorRange: getEditRange(
              editor,
              target.contentRange,
              isLine,
              this.isBefore
            ),
          };
      }
    });

    await this.runCommandTargets(editor, richTargets);
    await this.runDelimiterTargets(editor, richTargets);

    editor.selections = richTargets.map((target) =>
      selectionFromRange(target.target.isReversed, target.cursorRange)
    );
    const targetRanges = richTargets.map((target) => target.targetRange);

    return {
      thatMark: createThatMark(targets, targetRanges),
    };
  }

  async runDelimiterTargets(editor: TextEditor, targets: RichTarget[]) {
    const delimiterTargets: DelimiterTarget[] = targets.filter(
      (target): target is DelimiterTarget => target.type === "delimiter"
    );

    if (delimiterTargets.length === 0) {
      return;
    }

    const edits = delimiterTargets.map(({ delimiter, isLine, cursorRange }) => {
      return {
        text: isLine
          ? getLineEditText(editor, cursorRange, delimiter, this.isBefore)
          : delimiter,
        range: cursorRange,
        isReplace: this.isBefore,
      };
    });

    const [updatedTargetRanges, updatedCursorRanges] =
      await performEditsAndUpdateRanges(
        this.graph.rangeUpdater,
        editor,
        edits,
        [
          targets.map(({ targetRange }) => targetRange),
          targets.map(({ cursorRange }) => cursorRange),
        ]
      );

    updateTargets(targets, updatedTargetRanges, updatedCursorRanges);
  }

  async runCommandTargets(editor: TextEditor, targets: RichTarget[]) {
    const commandTargets: CommandTarget[] = targets.filter(
      (target): target is CommandTarget => target.type === "command"
    );

    if (commandTargets.length === 0) {
      return;
    }

    const command = ensureSingleCommand(commandTargets);

    if (this.isBefore) {
      await this.graph.actions.setSelectionBefore.run([
        commandTargets.map(({ target }) => target),
      ]);
    } else {
      await this.graph.actions.setSelectionAfter.run([
        commandTargets.map(({ target }) => target),
      ]);
    }

    const [updatedTargetRanges, updatedCursorRanges] =
      await callFunctionAndUpdateRanges(
        this.graph.rangeUpdater,
        () => commands.executeCommand(command),
        editor.document,
        [
          targets.map(({ targetRange }) => targetRange),
          targets.map(({ cursorRange }) => cursorRange),
        ]
      );

    updateTargets(targets, updatedTargetRanges, updatedCursorRanges);

    zip(commandTargets, editor.selections).forEach(
      ([commandTarget, cursorSelection]) => {
        commandTarget!.cursorRange = cursorSelection!;
      }
    );
  }
}

export class EditNewBefore extends EditNew {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class EditNewAfter extends EditNew {
  constructor(graph: Graph) {
    super(graph, false);
  }
}

interface CommonTarget {
  target: Target;
  targetRange: Range;
  cursorRange: Range;
}
interface CommandTarget extends CommonTarget {
  type: "command";
  command: string;
}
interface DelimiterTarget extends CommonTarget {
  type: "delimiter";
  delimiter: string;
  isLine: boolean;
}
type RichTarget = CommandTarget | DelimiterTarget;

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run multiple different commands at once");
  }
  return commands[0];
}

function getLineEditText(
  editor: TextEditor,
  range: Range,
  delimiter: string,
  isBefore: boolean
) {
  const line = editor.document.lineAt(isBefore ? range.start : range.end);
  const characterIndex = line.isEmptyOrWhitespace
    ? range.start.character
    : line.firstNonWhitespaceCharacterIndex;
  const padding = line.text.slice(0, characterIndex);
  return delimiter + padding;
}

function getEditRange(
  editor: TextEditor,
  range: Range,
  isLine: boolean,
  isBefore: boolean
) {
  // In case of trialing whitespaces we need to go to the end of the line(not content)
  const editRange =
    isLine && !isBefore ? editor.document.lineAt(range.end).range : range;
  const position = isBefore ? editRange.start : editRange.end;
  return new Range(position, position);
}

function updateTargets(
  targets: RichTarget[],
  updatedTargetRanges: Range[],
  updatedCursorRanges: Range[]
) {
  zip(targets, updatedTargetRanges, updatedCursorRanges).forEach(
    ([target, updatedTargetRange, updatedCursorRange]) => {
      target!.targetRange = updatedTargetRange!;
      target!.cursorRange = updatedCursorRange!;
    }
  );
}
