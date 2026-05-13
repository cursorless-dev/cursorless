import { flatten, zip } from "lodash-es";
import type { IDE, TextEditor } from "@cursorless/lib-common";
import { FlashStyle, Range, Selection } from "@cursorless/lib-common";
import { selectionToStoredTarget } from "../core/commandRunner/selectionToStoredTarget";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import type { Target } from "../typings/target.types";
import { flashTargets, runOnTargetsForEachEditor } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";
import {
  IndentLineSimpleAction,
  OutdentLineSimpleAction,
} from "./SimpleIdeCommandActions";

abstract class IndentLineBase {
  constructor(
    private ide: IDE,
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

    await flashTargets(this.ide, targets, FlashStyle.pendingModification0);

    const thatTargets = flatten(
      await runOnTargetsForEachEditor(targets, this.runForEditor),
    );

    return { thatTargets };
  }

  private hasCapability() {
    return this.isIndent
      ? this.ide.capabilities.commands.indentLine != null
      : this.ide.capabilities.commands.outdentLine != null;
  }

  private runSimpleCommandAction(
    targets: Target[],
  ): Promise<ActionReturnValue> {
    const action = this.isIndent
      ? new IndentLineSimpleAction(this.ide, this.rangeUpdater)
      : new OutdentLineSimpleAction(this.ide, this.rangeUpdater);
    return action.run(targets);
  }

  private async runForEditor(editor: TextEditor, targets: Target[]) {
    const edits = this.isIndent
      ? getIndentEdits(editor, targets)
      : getOutdentEdits(editor, targets);

    const { targetSelections: updatedTargetSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor: this.ide.getEditableTextEditor(editor),
        edits,
        selections: {
          targetSelections: targets.map(
            ({ contentSelection }) => contentSelection,
          ),
        },
      });

    return zip(targets, updatedTargetSelections).map(([target, range]) =>
      selectionToStoredTarget({
        editor,
        selection: Selection.fromRange(range!, target!.isReversed),
      }),
    );
  }
}

export class IndentLine extends IndentLineBase {
  constructor(ide: IDE, rangeUpdater: RangeUpdater) {
    super(ide, rangeUpdater, true);
  }
}

export class OutdentLine extends IndentLineBase {
  constructor(ide: IDE, rangeUpdater: RangeUpdater) {
    super(ide, rangeUpdater, false);
  }
}

function getIndentEdits(editor: TextEditor, targets: Target[]) {
  const { document } = editor;
  const lineNumbers = getLineNumbers(targets);
  const indent = getIndent(editor);
  return lineNumbers.map((lineNumber) => {
    const line = document.lineAt(lineNumber);
    return {
      range: Range.fromPosition(line.range.start),
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
    return new RegExp(`^[ ]{1,${tabSize}}`, "u");
  }
  return /^\t/u;
}

function getTabSize(editor: TextEditor): number {
  return typeof editor.options.tabSize === "number"
    ? editor.options.tabSize
    : 4;
}
