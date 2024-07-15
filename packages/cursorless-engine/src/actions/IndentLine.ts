import {
  FlashStyle,
  Range,
  type Selection,
  type TextEditor,
} from "@cursorless/common";
import { flatten, zip } from "lodash-es";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import {
  IndentLineSimpleAction,
  OutdentLineSimpleAction,
} from "./SimpleIdeCommandActions";
import { ActionReturnValue } from "./actions.types";
import { selectionToStoredTarget } from "../core/commandRunner/selectionToStoredTarget";

abstract class IndentLineBase {
  constructor(
    private rangeUpdater: RangeUpdater,
    private isIndent: boolean,
  ) {
    this.run = this.run.bind(this);
    this.runForEditor = this.runForEditor.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    if (this.hasCapability()) {
      return this.runSimpleCommandAction(targets);
    }

    await flashTargets(ide(), targets, FlashStyle.referenced);

    const thatTargets = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor),
    );

    return { thatTargets };
  }

  private hasCapability() {
    return this.isIndent
      ? ide().capabilities.commands.indentLine != null
      : ide().capabilities.commands.outdentLine != null;
  }

  private runSimpleCommandAction(
    targets: Target[],
  ): Promise<ActionReturnValue> {
    const action = this.isIndent
      ? new IndentLineSimpleAction(this.rangeUpdater)
      : new OutdentLineSimpleAction(this.rangeUpdater);
    return action.run(targets);
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    const edits = this.isIndent
      ? getIndentEdits(editor, targets)
      : getOutdentEdits(editor, targets);

    const cursorSelections = editor.selections;
    const targetSelections = targets.map(
      ({ contentSelection }) => contentSelection,
    );
    const editableEditor = ide().getEditableTextEditor(editor);

    const [updatedCursorSelections, updatedTargetSelections]: Selection[][] =
      await performEditsAndUpdateSelections(
        this.rangeUpdater,
        editableEditor,
        edits,
        [cursorSelections, targetSelections],
      );

    await editableEditor.setSelections(updatedCursorSelections);

    return zip(targets, updatedTargetSelections).map(([target, range]) =>
      selectionToStoredTarget({
        editor,
        selection: range!.toSelection(target!.isReversed),
      }),
    );
  }
}

export class IndentLine extends IndentLineBase {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, true);
  }
}

export class OutdentLine extends IndentLineBase {
  constructor(rangeUpdater: RangeUpdater) {
    super(rangeUpdater, false);
  }
}

function getIndentEdits(editor: TextEditor, targets: Target[]) {
  const { document } = editor;
  const lineNumbers = getLineNumbers(targets);
  const indent = getIndent(editor);
  return lineNumbers.map((lineNumber) => {
    const line = document.lineAt(lineNumber);
    return {
      range: line.range.start.toEmptyRange(),
      text: indent,
    };
  });
}

function getOutdentEdits(editor: TextEditor, targets: Target[]) {
  const { document } = editor;
  const lineNumbers = getLineNumbers(targets);
  const regex = getRegex(editor);
  return lineNumbers.map((lineNumber) => {
    const line = document.lineAt(lineNumber);
    const match = line.text.match(regex);
    const { start } = line.range;
    const end = start.translate(undefined, match?.[0].length);
    return {
      range: new Range(start, end),
      text: "",
    };
  });
}

function getLineNumbers(targets: Target[]) {
  const lineNumbers = new Set<number>();
  for (const target of targets) {
    const { start, end } = target.contentRange;
    for (let i = start.line; i <= end.line; ++i) {
      lineNumbers.add(i);
    }
  }
  return [...lineNumbers];
}

function getIndent(editor: TextEditor) {
  if (editor.options.insertSpaces) {
    const tabSize = getTabSize(editor);
    return " ".repeat(tabSize);
  }
  return "\t";
}

function getRegex(editor: TextEditor) {
  if (editor.options.insertSpaces) {
    const tabSize = getTabSize(editor);
    return new RegExp(`^[ ]{1,${tabSize}}`);
  }
  return /^\t/;
}

function getTabSize(editor: TextEditor): number {
  return typeof editor.options.tabSize === "number"
    ? editor.options.tabSize
    : 4;
}
