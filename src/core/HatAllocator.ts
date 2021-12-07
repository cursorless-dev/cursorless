import * as vscode from "vscode";
import { addDecorationsToEditors } from "../util/addDecorationsToEditor";
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
  private disposalFunctions: (() => void)[] = [];

  constructor(private graph: Graph, private context: Context) {
    graph.extensionContext.subscriptions.push(this);

    this.isActive = vscode.workspace
      .getConfiguration("cursorless")
      .get<boolean>("showOnStart")!;

    this.addDecorationsDebounced = this.addDecorationsDebounced.bind(this);
    this.toggleDecorations = this.toggleDecorations.bind(this);
    this.clearEditorDecorations = this.clearEditorDecorations.bind(this);

    this.disposalFunctions.push(
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

    const decorationDebounceDelay = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>("decorationDebounceDelay")!;

    this.timeoutHandle = setTimeout(() => {
      this.addDecorations();

      this.timeoutHandle = null;
    }, decorationDebounceDelay);
  }

  private toggleDecorations() {
    this.isActive = !this.isActive;
    this.addDecorationsDebounced();
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
    this.disposalFunctions.forEach((dispose) => dispose());

    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
