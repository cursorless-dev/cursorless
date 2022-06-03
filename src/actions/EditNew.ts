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

    const richTargets = targets.map<RichTarget>((target) => {
      const context = target.getEditNewContext(this.isBefore);

      switch (context.type) {
        case "command":
          return {
            target,
            thatTarget: target.thatTarget,
            cursorRange: undefined,
            type: "command",
            command: context.command,
          };
        case "delimiter":
          return {
            target,
            thatTarget: target.thatTarget,
            cursorRange: undefined,
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
      await this.runDelimiterTargets(
        editor,
        richTargets,
        commandTargets,
        delimiterTargets
      );
    }

    const newSelections = richTargets.map((target) =>
      selectionFromRange(target.target.isReversed, target.cursorRange!)
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
    allTargets: RichTarget[],
    commandTargets: CommandTarget[],
    delimiterTargets: DelimiterTarget[]
  ) {
    const position = this.isBefore ? "before" : "after";
    // NB: We don't use `constructEmptyChangeEdit` here because we want padding
    // if it's a line target
    const edits = delimiterTargets.flatMap((target) =>
      toPositionTarget(target.target, position).constructChangeEdit("")
    );

    const commandTargetCursorSelections = commandTargets.map(
      (richTarget) => richTarget.cursorRange
    );
    const thatTargetSelections = {
      selections: allTargets.map(
        ({ thatTarget }) => thatTarget.contentSelection
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
      updatedThatTargetSelections,
      updatedEditSelections,
    ]: Selection[][] = await performEditsAndUpdateSelectionsWithBehavior(
      this.graph.rangeUpdater,
      editor,
      edits,
      [commandTargetCursorSelections, thatTargetSelections, editSelections]
    );

    const insertionRanges = zip(edits, updatedEditSelections).map(
      ([edit, selection]) => edit!.updateRange(selection!)
    );

    updateRichTargets(
      delimiterTargets,
      updatedThatTargetSelections,
      insertionRanges
    );
    updateCommandTargets(commandTargets, updatedEditorSelections);
  }

  async runCommandTargets(
    editor: TextEditor,
    targets: RichTarget[],
    commandTargets: CommandTarget[]
  ) {
    const command = ensureSingleCommand(commandTargets);

    await this.setSelections(commandTargets.map(({ target }) => target));

    const [updatedThatTargetRanges, updatedTargetRanges] =
      await callFunctionAndUpdateRanges(
        this.graph.rangeUpdater,
        () => commands.executeCommand(command),
        editor.document,
        [
          targets.map(({ target }) => target.thatTarget.contentRange),
          targets.map(({ target }) => target.contentRange),
        ]
      );

    updateRichTargets(targets, {
      updatedThatTargetRanges,
      updatedTargetRanges,
    });
    updateRichTargets(commandTargets, {
      updatedCursorRanges: editor.selections,
    });
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
  /**
   * The target that we apply the edit to. Note that we keep this target up to
   * date as edits come in
   */
  target: Target;

  /**
   * The `that` target that we will return. Note that we keep this target up to
   * date as edits come in
   */
  thatTarget: Target;

  /**
   * The range of where we would like the cursor to end up before or after this
   * target. Note that this will be undefined at the start
   */
  cursorRange: Range | undefined;
}
interface CommandTarget extends CommonTarget {
  type: "command";
  command: string;
}
interface DelimiterTarget extends CommonTarget {
  type: "delimiter";
  delimiter: string;
}
/**
 * Keeps a target as well as information about how to perform and edit. The
 * target will be kept up to date as the edit is performed so that we can turn
 * it as a that mark. We also keep track of where the cursor should end up after
 * applying this edit
 */
type RichTarget = CommandTarget | DelimiterTarget;

function ensureSingleCommand(targets: CommandTarget[]) {
  const commands = targets.map((target) => target.command);
  if (new Set(commands).size > 1) {
    throw new Error("Can't run multiple different commands at once");
  }
  return commands[0];
}

interface RangesToUpdate {
  updatedTargetRanges?: readonly Range[];
  updatedThatTargetRanges?: readonly Range[];
  updatedCursorRanges?: readonly Range[];
}

function updateRichTargets(
  targets: RichTarget[],
  rangesToUpdate: RangesToUpdate
) {
  const { updatedTargetRanges, updatedThatTargetRanges, updatedCursorRanges } =
    rangesToUpdate;

  if (updatedTargetRanges != null) {
    zip(targets, updatedTargetRanges).forEach(
      ([target, updatedTargetRange]) => {
        target!.target = target!.target.withContentRange(updatedTargetRange!);
      }
    );
  }

  if (updatedThatTargetRanges != null) {
    zip(targets, updatedThatTargetRanges).forEach(
      ([target, updatedTargetRange]) => {
        target!.target = target!.target.withContentRange(updatedTargetRange!);
      }
    );
  }

  if (updatedCursorRanges != null) {
    zip(targets, updatedCursorRanges).forEach(
      ([target, updatedCursorRange]) => {
        target!.cursorRange = updatedCursorRange!;
      }
    );
  }
}
