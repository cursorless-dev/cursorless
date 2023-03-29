import {
  CommandServerApi,
  ExcludableSnapshotField,
  ExtraSnapshotField,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  SerializedMarks,
  TargetPlainObject,
  TestCaseSnapshot,
  TextEditor,
} from "@cursorless/common";
import {
  Graph,
  ide,
  injectIde,
  plainObjectToTarget,
  takeSnapshot,
  ThatMark,
} from "@cursorless/cursorless-engine";
import { toVscodeEditor, VscodeIDE } from "@cursorless/cursorless-vscode-core";
import { TestHelpers } from "@cursorless/vscode-common";
import * as vscode from "vscode";

export function constructTestHelpers(
  commandServerApi: CommandServerApi | null,
  thatMark: ThatMark,
  sourceMark: ThatMark,
  vscodeIDE: VscodeIDE,
  graph: Graph,
  hatTokenMap: HatTokenMap,
): TestHelpers | undefined {
  return {
    commandServerApi: commandServerApi!,
    ide: ide() as NormalizedIDE,
    injectIde,

    toVscodeEditor,

    // FIXME: Remove this once we have a better way to get this function
    // accessible from our tests
    takeSnapshot(
      excludeFields: ExcludableSnapshotField[],
      extraFields: ExtraSnapshotField[],
      editor: TextEditor,
      ide: IDE,
      marks: SerializedMarks | undefined,
      forceRealClipboard: boolean,
    ): Promise<TestCaseSnapshot> {
      return takeSnapshot(
        thatMark,
        sourceMark,
        excludeFields,
        extraFields,
        editor,
        ide,
        marks,
        undefined,
        undefined,
        forceRealClipboard ? vscodeIDE.clipboard : undefined,
      );
    },

    setThatMark(
      editor: vscode.TextEditor,
      targets: TargetPlainObject[] | undefined,
    ): void {
      thatMark.set(
        targets?.map((target) =>
          plainObjectToTarget(vscodeIDE.fromVscodeEditor(editor), target),
        ),
      );
    },
    setSourceMark(
      editor: vscode.TextEditor,
      targets: TargetPlainObject[] | undefined,
    ): void {
      sourceMark.set(
        targets?.map((target) =>
          plainObjectToTarget(vscodeIDE.fromVscodeEditor(editor), target),
        ),
      );
    },

    hatTokenMap,
  };
}
