import {
  commands,
  env,
  Range,
  Selection,
  TextEditor,
  ViewColumn,
  workspace,
} from "vscode";
import update from "immutability-helper";
import EditStyles from "./editStyles";
import {
  ActionPreferences,
  SelectionWithEditor,
  TypedSelection,
} from "./Types";
import { flatten, zip } from "lodash";
import { computeChangedOffsets } from "./computeChangedOffsets";
import {
  ensureSingleEditor,
  ensureSingleTarget,
  runForEachEditor,
} from "./targetUtils";
import displayPendingEditDecorations, {
  decorationSleep,
} from "./editDisplayUtils";
import { performInsideOutsideAdjustment } from "./performInsideOutsideAdjustment";

interface ActionReturnValue {
  returnValue: any;
  thatMark: SelectionWithEditor[];
}

interface Action {
  (targets: TypedSelection[][], ...args: any[]): Promise<ActionReturnValue>;
}

const columnFocusCommands = {
  [ViewColumn.One]: "workbench.action.focusFirstEditorGroup",
  [ViewColumn.Two]: "workbench.action.focusSecondEditorGroup",
  [ViewColumn.Three]: "workbench.action.focusThirdEditorGroup",
  [ViewColumn.Four]: "workbench.action.focusFourthEditorGroup",
  [ViewColumn.Five]: "workbench.action.focusFifthEditorGroup",
  [ViewColumn.Six]: "workbench.action.focusSixthEditorGroup",
  [ViewColumn.Seven]: "workbench.action.focusSeventhEditorGroup",
  [ViewColumn.Eight]: "workbench.action.focusEighthEditorGroup",
  [ViewColumn.Nine]: "workbench.action.focusNinthEditorGroup",
  [ViewColumn.Active]: "",
  [ViewColumn.Beside]: "",
};

export const targetPreferences: Record<keyof Actions, ActionPreferences[]> = {
  clear: [{ insideOutsideType: "inside" }],
  copy: [{ insideOutsideType: "inside" }],
  cut: [{ insideOutsideType: null }],
  delete: [{ insideOutsideType: "outside" }],
  extractVariable: [{ insideOutsideType: "inside" }],
  paste: [{ position: "after", insideOutsideType: "outside" }],
  setSelection: [{ insideOutsideType: "inside" }],
  setSelectionAfter: [{ insideOutsideType: "inside" }],
  setSelectionBefore: [{ insideOutsideType: "inside" }],
  wrap: [{ insideOutsideType: "inside" }],
};

class Actions {
  constructor(private styles: EditStyles) {
    this.clear = this.clear.bind(this);
    this.delete = this.delete.bind(this);
    this.paste = this.paste.bind(this);
    this.setSelection = this.setSelection.bind(this);
    this.setSelectionAfter = this.setSelectionAfter.bind(this);
    this.setSelectionBefore = this.setSelectionBefore.bind(this);
    this.wrap = this.wrap.bind(this);
  }

  setSelection: Action = async ([targets]) => {
    const editor = ensureSingleEditor(targets);

    if (editor.viewColumn != null) {
      await commands.executeCommand(columnFocusCommands[editor.viewColumn]);
    }
    editor.selections = targets.map((target) => target.selection.selection);
    editor.revealRange(editor.selections[0]);

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection),
    };
  };

  copy: Action = async ([targets]) => {
    await displayPendingEditDecorations(
      targets,
      this.styles.referenced,
      this.styles.referencedLine
    );

    await env.clipboard.writeText(
      targets
        .map((target) =>
          target.selection.editor.document.getText(target.selection.selection)
        )
        .join("\n")
    );

    return {
      returnValue: null,
      thatMark: targets.map((target) => target.selection),
    };
  };

  cut: Action = async ([targets]) => {
    await this.copy([
      targets.map((target) => performInsideOutsideAdjustment(target, "inside")),
    ]);

    const { thatMark } = await this.delete([
      targets.map((target) =>
        performInsideOutsideAdjustment(target, "outside")
      ),
    ]);

    return {
      returnValue: null,
      thatMark,
    };
  };

  extractVariable: Action = async ([targets]) => {
    ensureSingleTarget(targets);

    await this.setSelection([targets]);

    await commands.executeCommand("editor.action.codeAction", {
      kind: "refactor.extract.constant",
      preferred: true,
    });

    return {
      returnValue: null,
      thatMark: [],
    };
  };

  setSelectionBefore: Action = async ([targets]) => {
    return await this.setSelection([
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.start, selection.start),
            },
          },
        })
      ),
    ]);
  };

  setSelectionAfter: Action = async ([targets]) => {
    return await this.setSelection([
      targets.map((target) =>
        update(target, {
          selection: {
            selection: {
              $apply: (selection) =>
                new Selection(selection.end, selection.end),
            },
          },
        })
      ),
    ]);
  };

  delete: Action = async ([targets]) => {
    await displayPendingEditDecorations(
      targets,
      this.styles.pendingDelete,
      this.styles.pendingLineDelete
    );

    const thatMark = flatten(
      await runForEachEditor(targets, async (editor, selections) => {
        const newOffsets = computeChangedOffsets(
          selections.map((selection) => ({
            startOffset: editor.document.offsetAt(
              selection.selection.selection.start
            ),
            endOffset: editor.document.offsetAt(
              selection.selection.selection.end
            ),
            newTextLength: 0,
          }))
        );

        await editor.edit((editBuilder) => {
          selections.forEach((selection) => {
            // TODO Properly handle last line of file
            editBuilder.delete(selection.selection.selection);
          });
        });

        return newOffsets.map((offsetRange) => ({
          editor,
          selection: new Selection(
            editor.document.positionAt(offsetRange.startOffset),
            editor.document.positionAt(offsetRange.endOffset)
          ),
        }));
      })
    );

    return { returnValue: null, thatMark };
  };

  clear: Action = async ([targets]) => {
    const editor = ensureSingleEditor(targets);

    const { thatMark } = await this.delete([targets]);

    editor.selections = thatMark.map(({ selection }) => selection);

    return { returnValue: null, thatMark };
  };

  paste: Action = async ([targets]) => {
    throw new Error("Not implemented");
  };

  wrap: Action = async ([targets], left: string, right: string) => {
    const thatMark = flatten(
      await runForEachEditor<SelectionWithEditor[]>(
        targets,
        async (editor, selections) => {
          const originalInsertions = flatten(
            selections.map((selection, index) => [
              {
                originalOffset: editor.document.offsetAt(
                  selection.selection.selection.start
                ),
                length: left.length,
                selectionIndex: index,
                side: "left",
              },
              {
                originalOffset: editor.document.offsetAt(
                  selection.selection.selection.end
                ),
                length: right.length,
                selectionIndex: index,
                side: "right",
              },
            ])
          );

          const newInsertions = zip(
            originalInsertions,
            computeChangedOffsets(
              originalInsertions.map((insertion) => ({
                startOffset: insertion.originalOffset,
                endOffset: insertion.originalOffset,
                newTextLength: insertion.length,
              }))
            )
          ).map(([originalInsertion, changedInsertion]) => ({
            selectionIndex: originalInsertion!.selectionIndex,
            side: originalInsertion!.side,
            newStartOffset: changedInsertion!.startOffset,
            newEndOffset: changedInsertion!.endOffset,
          }));

          await editor.edit((editBuilder) => {
            selections.forEach((selection) => {
              editBuilder.insert(selection.selection.selection.start, left);
              editBuilder.insert(selection.selection.selection.end, right);
            });
          });

          editor.setDecorations(
            this.styles.justAdded,
            newInsertions.map(
              ({ newStartOffset, newEndOffset }) =>
                new Range(
                  editor.document.positionAt(newStartOffset),
                  editor.document.positionAt(newEndOffset)
                )
            )
          );

          await decorationSleep();

          editor.setDecorations(this.styles.justAdded, []);

          return selections.map((selection, index) => {
            const start = editor.document.positionAt(
              newInsertions.find(
                (insertion) =>
                  insertion.selectionIndex === index &&
                  insertion.side === "left"
              )!.newStartOffset
            );
            const end = editor.document.positionAt(
              newInsertions.find(
                (insertion) =>
                  insertion.selectionIndex === index &&
                  insertion.side === "right"
              )!.newEndOffset
            );

            const isReversed = selection.selection.selection.isReversed;

            return {
              editor,
              selection: new Selection(
                isReversed ? end : start,
                isReversed ? start : end
              ),
            };
          });
        }
      )
    );

    return { returnValue: null, thatMark };
  };
}

export default Actions;
