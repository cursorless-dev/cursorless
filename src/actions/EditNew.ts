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

    const {
      updatedTargetSelections,
      updatedCommandSelections,
      updatedDelimiterSelections,
    } = await this.runDelimiterTargets(
      editor,
      targetsWithSelection,
      commandSelections,
      delimiterTargets
    );

    editor.selections = zip([
      ...updatedCommandSelections,
      ...updatedDelimiterSelections,
    ], [
      ...commandTargets,
      ...delimiterTargets,
    ]).map(([updatedSelection, target]) => ());

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
        updatedCommandSelections: commandSelections,
        updatedDelimiterSelections: [],
        updatedTargetSelections: originalTargetSelections,
      };
    }

    const delimiterTargetInfos = delimiterTargets.map(
      ({ target, context: { delimiter }, index }) => {
        const targetSelection = targetsWithSelection[index].selection;

        const position = this.isBefore
          ? targetSelection.start
          : targetSelection.end;

        return {
          targetSelection,
          insertionSelection: new Selection(position, position),
          target,
          delimiter,
        };
      }
    );

    const edits = delimiterTargetInfos.flatMap(
      ({ delimiter, targetSelection, insertionSelection }) => {
        const [before, after] = delimiter.includes("\n")
          ? this.getLineEditTexts(editor, targetSelection, delimiter)
          : this.isBefore
          ? ["", delimiter]
          : [delimiter, ""];

        return [
          {
            text: before,
            range: insertionSelection,
            isReplace: false,
          },
          {
            text: after,
            range: insertionSelection,
            isReplace: true,
          },
        ].filter(({ text }) => !!text);
      }
    );

    const originalDelimiterSelections = delimiterTargetInfos.map(
      ({ insertionSelection }) => insertionSelection
    );

    const [
      updatedCommandSelections,
      updatedDelimiterSelections,
      updatedTargetSelections,
    ] = await performEditsAndUpdateSelections(
      this.graph.rangeUpdater,
      editor,
      edits,
      [commandSelections, originalDelimiterSelections, originalTargetSelections]
    );

    return {
      updatedTargetSelections,
      updatedCommandSelections,
      updatedDelimiterSelections,
    };
  }

  private getLineEditTexts(
    editor: TextEditor,
    selection: Selection,
    delimiter: string
  ) {
    const lineNumber = this.isBefore
      ? selection.start.line
      : selection.end.line;
    const line = editor.document.lineAt(lineNumber);
    const characterIndex = line.isEmptyOrWhitespace
      ? selection.start.character
      : line.firstNonWhitespaceCharacterIndex;
    const padding = line.text.slice(0, characterIndex);
    return this.isBefore ? [padding, delimiter] : [delimiter, padding];
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
  index: number;
  context: EditNewCommandContext;
}
interface DelimiterTarget {
  target: Target;
  index: number;
  context: EditNewDelimiterContext;
}
interface TargetWithSelection {
  target: Target;
  selection: Selection;
}

function groupTargets(targets: Target[], isBefore: boolean) {
  const commandTargets: CommandTarget[] = [];
  const delimiterTargets: DelimiterTarget[] = [];
  targets.forEach((target, index) => {
    const context = target.getEditNewContext(isBefore);
    switch (context.type) {
      case "command":
        commandTargets.push({ target, index, context });
        break;
      case "delimiter":
        delimiterTargets.push({ target, index, context });
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
