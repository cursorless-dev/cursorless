import * as vscode from "vscode";
import { addDecorationsToEditors } from "../util/addDecorationsToEditor";
import { DECORATION_DEBOUNCE_DELAY } from "../core/constants";
import { Graph } from "../typings/Types";
import { Disposable } from "vscode";
import { IndividualHatMap } from "./IndividualHatMap";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private timeoutHandle: NodeJS.Timeout | null = null;
  private isActive: boolean;
  private disposables: Disposable[] = [];
  private disposableFunctions: (() => void)[] = [];

  constructor(private graph: Graph, private context: Context) {
    this.isActive = vscode.workspace
      .getConfiguration("cursorless")
      .get<boolean>("showOnStart")!;

    this.addDecorationsDebounced = this.addDecorationsDebounced.bind(this);

    this.disposableFunctions.push(
      graph.decorations.registerDecorationChangeListener(
        this.addDecorationsDebounced
      )
    );

    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.toggleDecorations",
        this.toggleDecorations
      ),

      vscode.window.onDidChangeTextEditorVisibleRanges(
        this.addDecorationsDebounced
      ),
      vscode.window.onDidChangeActiveTextEditor(this.addDecorationsDebounced),
      vscode.window.onDidChangeVisibleTextEditors(this.addDecorationsDebounced),
      vscode.window.onDidChangeTextEditorSelection(
        this.addDecorationsDebounced
      ),
      vscode.workspace.onDidChangeTextDocument(this.addDecorationsDebounced)
    );
  }

  private clearEditorDecorations(editor: vscode.TextEditor) {
    this.graph.decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  async addDecorations() {
    const activeMap = await this.context.getActiveMap();

    if (this.isActive) {
      addDecorationsToEditors(activeMap, this.graph.decorations);
    } else {
      vscode.window.visibleTextEditors.forEach(this.clearEditorDecorations);
      activeMap.clear();
    }
  }

  addDecorationsDebounced() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    this.timeoutHandle = setTimeout(() => {
      this.addDecorations();

      this.timeoutHandle = null;
    }, DECORATION_DEBOUNCE_DELAY);
  }

  private toggleDecorations() {
    this.isActive = !this.isActive;
    this.addDecorationsDebounced();
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
    this.disposableFunctions.forEach((dispose) => dispose());

    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
