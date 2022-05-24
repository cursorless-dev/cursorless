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

    const { updatedCommandSelections, updatedTargetSelections } =
      await this.runDelimiterTargets(
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

    return { updatedCommandSelections, updatedTargetSelections };
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
      await this.graph.actions.setSelectionBefore.run([targets]);
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
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

  // async runDelimiter(targets: Target[], editor: TextEditor) {
  //   const edits = targets.map((target) => {
  //     const { contentRange } = target;
  //     const context = target.getEditNewContext(this.isBefore);
  //     const delimiter = (<any>context).delimiter as string;

  //     // Delimiter is one or more new lines. Handle as lines.
  //     if (delimiter.includes("\n")) {
  //       const lineNumber = this.isBefore
  //         ? contentRange.start.line
  //         : contentRange.end.line;
  //       const line = editor.document.lineAt(lineNumber);
  //       const characterIndex = line.isEmptyOrWhitespace
  //         ? contentRange.start.character
  //         : line.firstNonWhitespaceCharacterIndex;
  //       const padding = line.text.slice(0, characterIndex);
  //       const positionSelection = new Position(
  //         this.isBefore ? lineNumber : lineNumber + delimiter.length,
  //         characterIndex
  //       );
  //       return {
  //         contentRange,
  //         text: this.isBefore ? padding + delimiter : delimiter + padding,
  //         insertPosition: this.isBefore ? line.range.start : line.range.end,
  //         selection: new Selection(positionSelection, positionSelection),
  //         thatMarkRange: this.isBefore
  //           ? new Range(
  //               contentRange.start.translate({
  //                 lineDelta: delimiter.length,
  //               }),
  //               contentRange.end.translate({
  //                 lineDelta: delimiter.length,
  //               })
  //             )
  //           : contentRange,
  //       };
  //     }
  //     // Delimiter is something else. Handle as inline.
  //     else {
  //       const positionSelection = this.isBefore
  //         ? contentRange.start
  //         : contentRange.end.translate({
  //             characterDelta: delimiter.length,
  //           });
  //       return {
  //         contentRange,
  //         text: delimiter,
  //         insertPosition: this.isBefore ? contentRange.start : contentRange.end,
  //         selection: new Selection(positionSelection, positionSelection),
  //         thatMarkRange: this.isBefore
  //           ? new Range(
  //               contentRange.start.translate({
  //                 characterDelta: delimiter.length,
  //               }),
  //               contentRange.end.translate({
  //                 characterDelta: delimiter.length,
  //               })
  //             )
  //           : contentRange,
  //       };
  //     }
  //   });

  //   await editor.edit((editBuilder) => {
  //     edits.forEach((edit) => {
  //       editBuilder.replace(edit.insertPosition, edit.text);
  //     });
  //   });

  //   editor.selections = edits.map((edit) => edit.selection);

  //   const thatMarkRanges = edits.map((edit) => edit.thatMarkRange);

  //   return createThatMark(targets, thatMarkRanges);
  // }

  // async runCommand(targets: Target[], commands: string[]) {
  //   if (new Set(commands).size > 1) {
  //     throw new Error("Can't run multiple different commands at once");
  //   }
  //   if (this.isBefore) {
  //     await this.graph.actions.setSelectionBefore.run([targets]);
  //   } else {
  //     await this.graph.actions.setSelectionAfter.run([targets]);
  //   }
  //   await vscommands.executeCommand(commands[0]);
  //   return createThatMark(targets);
  // }
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
