import { zip } from "lodash";
import {
  commands,
  DecorationRangeBehavior,
  Range,
  Selection,
  TextEditor,
} from "vscode";
import {
  callFunctionAndUpdateRanges,
  performEditsAndUpdateSelectionsWithBehavior,
} from "../core/updateSelections/updateSelections";
import { weakContainingLineStage } from "../processTargets/modifiers/commonWeakContainingScopeStages";
import { toPositionTarget } from "../processTargets/modifiers/PositionStage";
import NotebookCellTarget from "../processTargets/targets/NotebookCellTarget";
import { Target } from "../typings/target.types";
import { Graph } from "../typings/Types";
import { selectionFromRange } from "../util/selectionUtils";
import { setSelectionsAndFocusEditor } from "../util/setSelectionsAndFocusEditor";
import {
  createThatMark,
  ensureSingleEditor,
  ensureSingleTarget,
} from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

class EditNew implements Action {
  getFinalStages = () => [weakContainingLineStage];

  constructor(private graph: Graph, private isBefore: boolean) {
    this.run = this.run.bind(this);
  }

  async run([targets]: [Target[]]): Promise<ActionReturnValue> {
    if (targets.some((target) => target.isNotebookCell)) {
      return this.handleNotebookCellTargets(targets);
    }

    const editor = ensureSingleEditor(targets);

    const richTargets: RichTarget[] = targets.map((target) => {
      const context = target.getEditNewContext(this.isBefore);
      const common = {
        target,
        cursorRange: target.contentRange,
      };
      switch (context.type) {
        case "command":
          return {
            ...common,
            type: "command",
            command: context.command,
          };
        case "delimiter":
          return {
            ...common,
            type: "delimiter",
            delimiter: context.delimiter,
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

    const newSelections = richTargets.map((target) =>
      selectionFromRange(target.target.isReversed, target.cursorRange)
    );
    await setSelectionsAndFocusEditor(editor, newSelections);

    return {
      thatMark: createThatMark(richTargets.map(({ target }) => target)),
    };
  }

  async handleNotebookCellTargets(
    targets: Target[]
  ): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets) as NotebookCellTarget;
    await this.setSelections([target]);
    const command = target.getEditNewCommand(this.isBefore);
    await commands.executeCommand(command);
    const thatMark = createThatMark([target.thatTarget]);

    // Inserting a new jupyter cell above pushes the previous one down two lines
    if (command === "jupyter.insertCellAbove") {
      thatMark[0].selection = new Selection(
        thatMark[0].selection.anchor.translate({ lineDelta: 2 }),
        thatMark[0].selection.active.translate({ lineDelta: 2 })
      );
    }

    return { thatMark };
  }

  async runDelimiterTargets(
    editor: TextEditor,
    commandTargets: CommandTarget[],
    delimiterTargets: DelimiterTarget[]
  ) {
    const position = this.isBefore ? "before" : "after";
    const edits = delimiterTargets.flatMap((target) =>
      toPositionTarget(target.target, position).constructChangeEdit("")
    );

    const cursorSelections = { selections: editor.selections };
    const contentSelections = {
      selections: delimiterTargets.map(
        ({ target }) => target.thatTarget.contentSelection
      ),
    };
    const editSelections = {
      selections: edits.map(
        ({ range }) => new Selection(range.start, range.end)
      ),
      rangeBehavior: DecorationRangeBehavior.OpenOpen,
    };

    const [
      updatedEditorSelections,
      updatedContentSelections,
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.graph.rangeUpdater,
      editor,
      edits,
      [cursorSelections, contentSelections, editSelections]
    );

    const insertionRanges = zip(edits, updatedEditSelections).map(
      ([edit, selection]) => edit!.updateRange(selection!)
    );

    updateTargets(delimiterTargets, updatedContentSelections, insertionRanges);
    updateCommandTargets(commandTargets, updatedEditorSelections);
  }

  async runCommandTargets(
    editor: TextEditor,
    targets: RichTarget[],
    commandTargets: CommandTarget[]
  ) {
    const command = ensureSingleCommand(commandTargets);

    await this.setSelections(commandTargets.map(({ target }) => target));

    const [updatedTargetRanges, updatedCursorRanges] =
      await callFunctionAndUpdateRanges(
        this.graph.rangeUpdater,
        () => commands.executeCommand(command),
        editor.document,
        [
          targets.map(({ target }) => target.thatTarget.contentRange),
          targets.map(({ cursorRange }) => cursorRange),
        ]
      );

    updateTargets(targets, updatedTargetRanges, updatedCursorRanges);
    updateCommandTargets(commandTargets, editor.selections);
  }

  private async setSelections(targets: Target[]) {
    if (this.isBefore) {
      await this.graph.actions.setSelectionBefore.run([targets]);
    } else {
      await this.graph.actions.setSelectionAfter.run([targets]);
    }
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
  cursorRange: Range;
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
      target!.target = target!.target.withContentRange(updatedTargetRange!);
      target!.cursorRange = updatedCursorRange!;
    }
  );
}
