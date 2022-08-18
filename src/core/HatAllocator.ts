import * as vscode from "vscode";
import { Disposable } from "vscode";
import { Graph } from "../typings/Types";
import { addDecorationsToEditors } from "../util/addDecorationsToEditor";
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

      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      vscode.window.onDidChangeActiveTextEditor(this.addDecorationsDebounced),
      // An Event which fires when the array of visible editors has changed.
      vscode.window.onDidChangeVisibleTextEditors(this.addDecorationsDebounced),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      vscode.workspace.onDidChangeTextDocument(this.addDecorationsDebounced),
      // An Event which fires when the selection in an editor has changed.
      vscode.window.onDidChangeTextEditorSelection(
        this.addDecorationsDebounced
      ),
      // An Event which fires when the visible ranges of an editor has changed.
      vscode.window.onDidChangeTextEditorVisibleRanges(
        this.addDecorationsDebounced
      ),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      graph.tokenGraphemeSplitter.registerAlgorithmChangeListener(
        this.addDecorationsDebounced
      )
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
      addDecorationsToEditors(
        activeMap,
        this.graph.decorations,
        this.graph.tokenGraphemeSplitter
      );
    } else {
      vscode.window.visibleTextEditors.forEach(this.clearEditorDecorations);
      activeMap.clear();
    }
  }

  addDecorationsDebounced() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    const decorationDebounceDelayMs = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>("decorationDebounceDelayMs")!;

    this.timeoutHandle = setTimeout(() => {
      this.addDecorations();
      this.timeoutHandle = null;
    }, decorationDebounceDelayMs);
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
