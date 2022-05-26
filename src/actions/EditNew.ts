import { zip } from "lodash";
import { commands, Range, TextEditor } from "vscode";
import { callFunctionAndUpdateRanges } from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { selectionFromRange } from "../util/selectionUtils";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { insertTextAfter, insertTextBefore } from "../util/textInsertion";
import { Action, ActionReturnValue } from "./actions.types";

class EditNew implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const richTargets: RichTarget[] = targets.map((target) => {
      const context = target.getEditNewContext(this.isBefore);
      const common = {
        target,
        targetRange: target.thatTarget.contentRange,
        cursorRange: target.contentRange,
      };
      switch (context.type) {
        case "command":
          return {
            ...common,
            type: "command",
            command: context.command,
            updateSelection: !context.dontUpdateSelection,
          };
        case "delimiter":
          return {
            ...common,
            type: "delimiter",
            delimiter: context.delimiter,
            updateSelection: true,
          };
      }
    });

    const commandTargets: CommandTarget[] = richTargets.filter(
      (target): target is CommandTarget => target.type === "command"
    );
    const delimiterTargets: DelimiterTarget[] = richTargets.filter(
      (target): target is DelimiterTarget => target.type === "delimiter"
    );

    if (commandTargets.length > 0) {
      await this.runCommandTargets(editor, richTargets, commandTargets);
    }
    if (delimiterTargets.length > 0) {
      await this.runDelimiterTargets(editor, commandTargets, delimiterTargets);
    }

    // Only update selection if all targets are agreeing on this
    if (!richTargets.find(({ updateSelection }) => !updateSelection)) {
      const newSelections = richTargets.map((target) =>
        selectionFromRange(target.target.isReversed, target.cursorRange)
      );
      await setSelectionsAndFocusEditor(editor, newSelections);
    }

    const targetRanges = richTargets.map((target) => target.targetRange);

    return {
      thatMark: createThatMark(targets, targetRanges),
    };
  }

  async runDelimiterTargets(
    editor: TextEditor,
    commandTargets: CommandTarget[],
    delimiterTargets: DelimiterTarget[]
  ) {
    const textInsertions = delimiterTargets.map((target) => {
      return {
        range: target.targetRange,
        delimiter: target.delimiter,
        text: "",
      };
    });

    const { updatedEditorSelections, updatedContentRanges, insertionRanges } =
      this.isBefore
        ? await insertTextBefore(this.graph, editor, textInsertions)
        : await insertTextAfter(this.graph, editor, textInsertions);

    updateTargets(delimiterTargets, updatedContentRanges, insertionRanges);
    updateCommandTargets(commandTargets, updatedEditorSelections);
  }

  async runCommandTargets(
    editor: TextEditor,
    targets: RichTarget[],
    commandTargets: CommandTarget[]
  ) {
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
    updateCommandTargets(commandTargets, editor.selections);
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
  updateSelection: boolean;
}
interface CommandTarget extends CommonTarget {
  type: "command";
  command: string;
}
interface DelimiterTarget extends CommonTarget {
  type: "delimiter";
  delimiter: string;
}
type RichTarget = CommandTarget | DelimiterTarget;

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run multiple different commands at once");
  }
  return commands[0];
}

function updateCommandTargets(
  targets: CommandTarget[],
  cursorRanges: readonly Range[]
) {
  targets.forEach((target, i) => {
    target.cursorRange = cursorRanges[i];
  });
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
