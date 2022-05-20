import {
  commands as vscommands,
  Position,
  Range,
  Selection,
  TextEditor,
} from "vscode";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { createThatMark, ensureSingleEditor } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class EditNewLine implements Action {
  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const targetsWithContext = targets.map((target) => ({
      target,
      context: target.getEditNewLineContext(this.isBefore),
    }));
    const commandTargets = targetsWithContext.filter(
      ({ context }) => !!(<any>context).command
    );
    const delimiterTargets = targetsWithContext.filter(
      ({ context }) => !!(<any>context).delimiter
    );

    if (commandTargets.length > 0 && delimiterTargets.length > 0) {
      throw new Error("Can't insert edit using command and delimiter at once");
    }

    if (commandTargets.length > 0) {
      const commands = commandTargets.map(
        ({ context }) => (<any>context).command
      );
      return {
        thatMark: await this.runCommand(targets, commands),
      };
    }

    return {
      thatMark: await this.runDelimiter(targets, editor),
    };
  }

  async runDelimiter(targets: Target[], editor: TextEditor) {
    const edits = targets.map((target) => {
      const { contentRange } = target;
      const context = target.getEditNewLineContext(this.isBefore);
      const delimiter = (<any>context).delimiter as string;

      // Delimiter is one or more new lines. Handle as lines.
      if (delimiter.includes("\n")) {
        const lineNumber = this.isBefore
          ? contentRange.start.line
          : contentRange.end.line;
        const line = editor.document.lineAt(lineNumber);
        const characterIndex = line.isEmptyOrWhitespace
          ? contentRange.start.character
          : line.firstNonWhitespaceCharacterIndex;
        const padding = line.text.slice(0, characterIndex);
        const positionSelection = new Position(
          this.isBefore ? lineNumber : lineNumber + delimiter.length,
          characterIndex
        );
        return {
          contentRange,
          text: this.isBefore ? padding + delimiter : delimiter + padding,
          insertPosition: this.isBefore ? line.range.start : line.range.end,
          selection: new Selection(positionSelection, positionSelection),
          thatMarkRange: this.isBefore
            ? new Range(
                contentRange.start.translate({
                  lineDelta: delimiter.length,
                }),
                contentRange.end.translate({
                  lineDelta: delimiter.length,
                })
              )
            : contentRange,
        };
      }
      // Delimiter is something else. Handle as inline.
      else {
        const positionSelection = this.isBefore
          ? contentRange.start
          : contentRange.end.translate({
              characterDelta: delimiter.length,
            });
        return {
          contentRange,
          text: delimiter,
          insertPosition: this.isBefore ? contentRange.start : contentRange.end,
          selection: new Selection(positionSelection, positionSelection),
          thatMarkRange: this.isBefore
            ? new Range(
                contentRange.start.translate({
                  characterDelta: delimiter.length,
                }),
                contentRange.end.translate({
                  characterDelta: delimiter.length,
                })
              )
            : contentRange,
        };
      }
    });

    await editor.edit((editBuilder) => {
      edits.forEach((edit) => {
        editBuilder.replace(edit.insertPosition, edit.text);
      });
    });

    editor.selections = edits.map((edit) => edit.selection);

    const thatMarkRanges = edits.map((edit) => edit.thatMarkRange);

    return createThatMark(targets, thatMarkRanges);
  }

  async runCommand(targets: Target[], commands: string[]) {
    if (new Set(commands).size > 1) {
      throw new Error("Can't run multiple different commands at once");
    }
    if (this.isBefore) {
      await this.graph.actions.setSelectionBefore.run([targets]);
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
    }
    await vscommands.executeCommand(commands[0]);
    return createThatMark(targets);
  }
}

export class EditNewLineAbove extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, true);
  }
}

export class EditNewLineBelow extends EditNewLine {
  constructor(graph: Graph) {
    super(graph, false);
  }
}
