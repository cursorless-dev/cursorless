import assert from "node:assert/strict";
import { createSandbox } from "sinon";
import type { NotebookEditor, TextDocument, TextEditor } from "vscode";
import { Uri, ViewColumn, window } from "vscode";
import { getNotebookFromCellEditor } from "@cursorless/lib-vscode-common";

suite("Notebook editor lookup", () => {
  const sandbox = createSandbox();
  const document = {
    uri: Uri.parse("vscode-notebook-cell:/test.ipynb#cell1"),
  } as TextDocument;
  let first: NotebookEditor;
  let second: NotebookEditor;
  let cellEditor: TextEditor;
  let visibleNotebookEditors: NotebookEditor[];
  let activeTextEditor: TextEditor | undefined;
  let activeNotebookEditor: NotebookEditor | undefined;

  setup(() => {
    first = createNotebookEditor(ViewColumn.One);
    second = createNotebookEditor(ViewColumn.Two);
    cellEditor = { document } as TextEditor;
    visibleNotebookEditors = [first, second];
    activeTextEditor = undefined;
    activeNotebookEditor = undefined;
    sandbox
      .stub(window, "visibleNotebookEditors")
      .get(() => visibleNotebookEditors);
    sandbox.stub(window, "activeTextEditor").get(() => activeTextEditor);
    sandbox
      .stub(window, "activeNotebookEditor")
      .get(() => activeNotebookEditor);
  });

  teardown(() => sandbox.restore());

  test("resolves a notebook visible in only one group", () => {
    visibleNotebookEditors = [second];

    assert.equal(getNotebookFromCellEditor(cellEditor), second);
  });

  test("uses the target editor's group rather than the active notebook", () => {
    cellEditor = { document, viewColumn: ViewColumn.Two } as TextEditor;
    activeNotebookEditor = first;

    assert.equal(getNotebookFromCellEditor(cellEditor), second);
  });

  test("resolves the active cell editor in the second split", () => {
    activeTextEditor = cellEditor;
    activeNotebookEditor = second;

    assert.equal(getNotebookFromCellEditor(cellEditor), second);
  });

  test("rejects an inactive target even when its document is active", () => {
    activeTextEditor = { document } as TextEditor;
    activeNotebookEditor = second;

    assert.throws(
      () => getNotebookFromCellEditor(cellEditor),
      /split notebook is unsupported/u,
    );
  });

  test("rejects an active notebook that doesn't contain the target", () => {
    activeTextEditor = cellEditor;
    activeNotebookEditor = createNotebookEditor(ViewColumn.Three, {
      uri: Uri.parse("vscode-notebook-cell:/other.ipynb#cell1"),
    } as TextDocument);

    assert.throws(
      () => getNotebookFromCellEditor(cellEditor),
      /split notebook is unsupported/u,
    );
  });

  test("reports when the notebook is no longer visible", () => {
    visibleNotebookEditors = [];

    assert.throws(
      () => getNotebookFromCellEditor(cellEditor),
      /Couldn't find notebook editor/u,
    );
  });

  function createNotebookEditor(
    viewColumn: ViewColumn,
    cellDocument = document,
  ): NotebookEditor {
    return {
      notebook: { getCells: () => [{ document: cellDocument }] },
      viewColumn,
    } as NotebookEditor;
  }
});
