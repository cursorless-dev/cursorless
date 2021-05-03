import {
  commands,
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
import { promisify } from "util";
import { isLineSelectionType } from "./selectionType";
import { groupBy } from "./itertools";
import { flatten, zip } from "lodash";
import { computeChangedOffsets } from "./computeChangedOffsets";

const sleep = promisify(setTimeout);

async function decorationSleep() {
  const pendingEditDecorationTime = workspace
    .getConfiguration("cursorless")
    .get<number>("pendingEditDecorationTime")!;

  await sleep(pendingEditDecorationTime);
}

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

function getSingleEditor(targets: TypedSelection[]) {
  const editors = targets.map((target) => target.selection.editor);

  if (new Set(editors).size > 1) {
    throw new Error("Can only select from one document at a time");
  }

  return editors[0];
}

async function runForEachEditor<T>(
  targets: TypedSelection[],
  func: (editor: TextEditor, selections: TypedSelection[]) => Promise<T>
): Promise<T[]> {
  return await Promise.all(
    Array.from(
      groupBy(targets, (target) => target.selection.editor),
      async ([editor, selections]) => func(editor, selections)
    )
  );
}

export const targetPreferences: Record<keyof Actions, ActionPreferences[]> = {
  clear: [{ insideOutsideType: "inside" }],
  delete: [{ insideOutsideType: "outside" }],
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
    const editor = getSingleEditor(targets);

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

        editor.setDecorations(
          this.styles.pendingDelete,
          selections
            .filter(
              (selection) => !isLineSelectionType(selection.selectionType)
            )
            .map((selection) => selection.selection.selection)
        );

        editor.setDecorations(
          this.styles.pendingLineDelete,
          selections
            .filter((selection) => isLineSelectionType(selection.selectionType))
            .map((selection) =>
              selection.selection.selection.with(
                undefined,
                // NB: We move end up one line because it is at beginning of
                // next line
                selection.selection.selection.end.translate(-1)
              )
            )
        );

        await decorationSleep();

        editor.setDecorations(this.styles.pendingDelete, []);
        editor.setDecorations(this.styles.pendingLineDelete, []);

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
    const editor = getSingleEditor(targets);

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
