import { zip } from "lodash";
import { commands, Range, Selection, TextEditor } from "vscode";
import {
  callFunctionAndUpdateSelections,
  performEditsAndUpdateSelections,
} from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import {
  EditNewCommandContext,
  EditNewDelimiterContext,
  Target,
} from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class EditNew implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);
    const { commandTargets, delimiterTargets } = groupTargets(
      targets,
      this.isBefore
    );

    const { targetsWithSelection, commandSelections } =
      await this.runCommandTargets(editor, targets, commandTargets);

    const { updatedTargetSelections } = await this.runDelimiterTargets(
      editor,
      targetsWithSelection,
      commandSelections,
      delimiterTargets
    );

    return {
      thatMark: createThatMark(targets, updatedTargetSelections),
    };
  }

  async runDelimiterTargets(
    editor: TextEditor,
    targetsWithSelection: TargetWithSelection[],
    commandSelections: readonly Selection[],
    delimiterTargets: DelimiterTarget[]
  ) {
    const originalTargetSelections = targetsWithSelection.map(
      (selection) => selection.selection
    );

    if (delimiterTargets.length < 1) {
      return {
        updatedTargetSelections: originalTargetSelections,
      };
    }

    const edits = delimiterTargets.map((target) => {
      const selection = targetsWithSelection.find(
        (selection) => selection.target === target.target
      )!.selection;
      const position = this.isBefore ? selection.start : selection.end;
      return {
        text: target!.context.delimiter,
        range: new Range(position, position),
        isReplace: !this.isBefore,
      };
    });

    const [updatedCommandSelections, updatedTargetSelections] =
      await performEditsAndUpdateSelections(
        this.graph.rangeUpdater,
        editor,
        edits,
        [commandSelections, originalTargetSelections]
      );

    targetsWithSelection.forEach((target, i) => {
      target.selection = updatedTargetSelections[i];
    });

    const newSelections = [
      ...updatedCommandSelections,
      ...delimiterTargets.map((target) => {
        const selection = targetsWithSelection.find(
          (selection) => selection.target === target.target
        )!.selection;
        const delimiter = target.context.delimiter;
        const isLine = delimiter.includes("\n");
        const delta = delimiter.length;
        const position = this.isBefore ? selection.start : selection.end;
        const updatedPosition = isLine
          ? position.translate({ lineDelta: -delta })
          : position.translate({ characterDelta: -delta });
        return new Selection(updatedPosition, updatedPosition);
      }),
    ];

    editor.selections = newSelections;

    return { updatedTargetSelections };
  }

  async runCommandTargets(
    editor: TextEditor,
    targets: Target[],
    commandTargets: CommandTarget[]
  ) {
    if (commandTargets.length === 0) {
      return {
        targetsWithSelection: targets.map((target) => ({
          target: target,
          selection: target.contentSelection,
        })),
        commandSelections: [],
      };
    }

    const command = ensureSingleCommand(commandTargets);
    if (this.isBefore) {
      await this.graph.actions.setSelectionBefore.run([
        commandTargets.map((target) => target.target),
      ]);
    } else {
      await this.graph.actions.setSelectionAfter.run([
        commandTargets.map((target) => target.target),
      ]);
    }

    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      this.graph.rangeUpdater,
      () => commands.executeCommand(command),
      editor.document,
      [targets.map((target) => target.contentSelection)]
    );

    return {
      targetsWithSelection: zip(targets, updatedTargetSelections).map(
        ([target, selection]) => ({ target: target!, selection: selection! })
      ),
      commandSelections: editor.selections,
    };
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

interface CommandTarget {
  target: Target;
  context: EditNewCommandContext;
}
interface DelimiterTarget {
  target: Target;
  context: EditNewDelimiterContext;
}
interface TargetWithSelection {
  target: Target;
  selection: Selection;
}

function groupTargets(targets: Target[], isBefore: boolean) {
  const commandTargets: CommandTarget[] = [];
  const delimiterTargets: DelimiterTarget[] = [];
  targets.forEach((target) => {
    const context = target.getEditNewContext(isBefore);
    switch (context.type) {
      case "command":
        commandTargets.push({ target, context });
        break;
      case "delimiter":
        delimiterTargets.push({ target, context });
        break;
    }
  });
  return { commandTargets, delimiterTargets };
}

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.context.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run multiple different commands at once");
  }
  return commands[0];
}
