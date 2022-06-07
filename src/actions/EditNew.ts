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

    let state: State = {
      targets,
      thatRanges: targets.map(({ thatTarget }) => thatTarget.contentRange),
      // The range updater doesn't work with sparsely populated arrays. All these values will get over written.
      cursorRanges: new Array(targets.length).fill(new Range(0, 0, 0, 0)),
    };

    state = await this.runCommandTargets(editor, state);
    state = await this.runDelimiterTargets(editor, state);

    const newSelections = state.targets.map((target, index) =>
      selectionFromRange(target.isReversed, state.cursorRanges[index])
    );
    await setSelectionsAndFocusEditor(editor, newSelections);

    return {
      thatMark: createThatMark(state.targets, state.thatRanges),
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

  async runCommandTargets(editor: TextEditor, state: State): Promise<State> {
    const commandTargets: CommandTarget[] = state.targets
      .map((target, index) => {
        const context = target.getEditNewContext(this.isBefore);
        if (context.type === "command") {
          return {
            target,
            index,
            command: context.command,
          };
        }
      })
      .filter((target): target is CommandTarget => !!target);

    if (commandTargets.length === 0) {
      return state;
    }

    const command = ensureSingleCommand(commandTargets);

    await this.setSelections(commandTargets.map(({ target }) => target));

    const [updatedTargetRanges, updatedThatRanges] =
      await callFunctionAndUpdateRanges(
        this.graph.rangeUpdater,
        () => commands.executeCommand(command),
        editor.document,
        [
          state.targets.map(({ contentRange }) => contentRange),
          state.thatRanges,
        ]
      );

    const cursorRanges = [...state.cursorRanges];
    commandTargets.forEach((commandTarget, index) => {
      cursorRanges[commandTarget.index] = editor.selections[index];
    });

    return {
      targets: state.targets.map((target, index) =>
        target.withContentRange(updatedTargetRanges[index])
      ),
      thatRanges: updatedThatRanges,
      cursorRanges,
    };
  }

  async runDelimiterTargets(editor: TextEditor, state: State): Promise<State> {
    const delimiterTargets: DelimiterTarget[] = state.targets
      .map((target, index) => {
        const context = target.getEditNewContext(this.isBefore);
        if (context.type === "delimiter") {
          return {
            target,
            index,
          };
        }
      })
      .filter((target): target is DelimiterTarget => !!target);

    if (delimiterTargets.length === 0) {
      return state;
    }

    const position = this.isBefore ? "before" : "after";
    const edits = delimiterTargets.map((target) =>
      toPositionTarget(target.target, position).constructChangeEdit("")
    );

    const thatSelections = {
      selections: state.thatRanges.map(toSelection),
    };

    const cursorSelections = {
      selections: state.cursorRanges.map(toSelection),
      rangeBehavior: DecorationRangeBehavior.OpenOpen,
    };

    const editSelections = {
      selections: edits.map((edit) => toSelection(edit.range)),
      rangeBehavior: DecorationRangeBehavior.OpenOpen,
    };

    const [
      updatedThatSelections,
      updatedCursorSelections,
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.graph.rangeUpdater,
      editor,
      edits,
      [thatSelections, cursorSelections, editSelections]
    );

    const cursorRanges = <Range[]>[...updatedCursorSelections];
    delimiterTargets.forEach((delimiterTarget, index) => {
      const edit = edits[index];
      const range = edit.updateRange(updatedEditSelections[index]);
      cursorRanges[delimiterTarget.index] = range;
    });

    return {
      targets: state.targets,
      thatRanges: updatedThatSelections,
      cursorRanges,
    };
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

interface CommandTarget {
  target: Target;
  index: number;
  command: string;
}

interface DelimiterTarget {
  target: Target;
  index: number;
}

interface State {
  targets: Target[];
  thatRanges: Range[];
  cursorRanges: Range[];
}

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run different commands at once");
  }
  return commands[0];
}

function toSelection(range: Range) {
  return new Selection(range.start, range.end);
}
