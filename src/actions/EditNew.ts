import { zip } from "lodash";
import {
  commands,
  commands as vscommands,
  Position,
  Range,
  Selection,
  TextEditor,
} from "vscode";
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

    const {
      updatedCommandTargetSelections,
      updatedDelimiterTargetSelections,
      commandSelections,
    } = await this.runCommandTargets(editor, commandTargets, delimiterTargets);

    if (updatedDelimiterTargetSelections.length < 1) {
      return {
        thatMark: updatedCommandTargetSelections.map((selection) => ({
          editor,
          selection,
        })),
      };
    }

    const edits = zip(delimiterTargets, updatedDelimiterTargetSelections).map(
      ([target, selection]) => {
        const position = this.isBefore ? selection!.start : selection!.end;
        return {
          text: target!.context.delimiter,
          range: new Range(position, position),
          isReplace: !this.isBefore,
        };
      }
    );

    const originalThatSelections = [
      ...updatedCommandTargetSelections,
      ...updatedDelimiterTargetSelections,
    ];

    const [updatedCommandSelections] = await performEditsAndUpdateSelections(
      this.graph.rangeUpdater,
      editor,
      edits,
      [originalThatSelections]
    );

    return {
      thatMark: updatedCommandSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }

  async runCommandTargets(
    editor: TextEditor,
    commandTargets: CommandTarget[],
    delimiterTargets: DelimiterTarget[]
  ) {
    const originalDelimiterTargetSelections = delimiterTargets.map(
      (target) => target.target.contentSelection
    );
    if (commandTargets.length === 0) {
      return {
        updatedCommandTargetSelections: [],
        updatedDelimiterTargetSelections: originalDelimiterTargetSelections,
        commandSelections: [],
      };
    }

    const originalCommandTargetSelections = commandTargets.map(
      (target) => target.target.contentSelection
    );

    const command = ensureSingleCommand(commandTargets);
    const targets = commandTargets.map((target) => target.target);
    if (this.isBefore) {
      await this.graph.actions.setSelectionBefore.run([targets]);
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
    }

    const [updatedCommandTargetSelections, updatedDelimiterTargetSelections] =
      await callFunctionAndUpdateSelections(
        this.graph.rangeUpdater,
        () => vscommands.executeCommand(command),
        editor.document,
        [originalCommandTargetSelections, originalDelimiterTargetSelections]
      );

    return {
      updatedCommandTargetSelections,
      updatedDelimiterTargetSelections,
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
