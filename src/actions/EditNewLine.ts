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
  constructor(private graph: Graph, private isAbove: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);

    const targetsWithContext = targets.map((target) => ({
      target,
      context: target.getEditNewLineContext(this.isAbove),
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
      const context = target.getEditNewLineContext(this.isAbove);
      const delimiter = (<any>context).delimiter as string;
      const lineNumber = this.isAbove
        ? target.contentRange.start.line
        : target.contentRange.end.line;
      const line = editor.document.lineAt(lineNumber);
      const { firstNonWhitespaceCharacterIndex } = line;
      const padding = line.text.slice(0, firstNonWhitespaceCharacterIndex);
      const text = this.isAbove ? padding + delimiter : delimiter + padding;
      const position = this.isAbove ? line.range.start : line.range.end;
      const lineDelta = delimiter.length;
      return {
        contentRange: target.contentRange,
        lineDelta,
        firstNonWhitespaceCharacterIndex,
        position,
        text,
      };
    });

    await editor.edit((editBuilder) => {
      edits.forEach((edit) => {
        editBuilder.replace(edit.position, edit.text);
      });
    });

    editor.selections = edits.map((edit) => {
      const selectionLineNum = this.isAbove
        ? edit.position.line
        : edit.position.line + edit.lineDelta;
      const positionSelection = new Position(
        selectionLineNum,
        edit.firstNonWhitespaceCharacterIndex
      );
      return new Selection(positionSelection, positionSelection);
    });

    const thatMarkRanges = edits.map((edit) => {
      const { contentRange, lineDelta } = edit;
      return this.isAbove
        ? new Range(
            contentRange.start.translate({ lineDelta }),
            contentRange.end.translate({ lineDelta })
          )
        : contentRange;
    });

    return createThatMark(targets, thatMarkRanges);
  }

  async runCommand(targets: Target[], commands: string[]) {
    if (new Set(commands).size > 1) {
      throw new Error("Can't run multiple different commands at once");
    }
    if (this.isAbove) {
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
