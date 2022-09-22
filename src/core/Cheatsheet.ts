import * as vscode from "vscode";
import { Graph } from "../typings/Types";
import { readFile, writeFile } from "fs/promises";
import path = require("path");
import parse from "node-html-parser";

type SpokenFormInfo = unknown;

/**
 * The argument expected by the cheatsheet command.
 */
interface CheatSheetCommandArg {
  /**
   * The version of the cheatsheet command.
   */
  version: 0;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   */
  spokenFormInfo: SpokenFormInfo;

  /**
   * The file to write the cheatsheet to
   */
  outputPath: string;
}

export default class Cheatsheet {
  private disposables: vscode.Disposable[] = [];

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);

    this.showCheatsheet = this.showCheatsheet.bind(this);
    this.updateDefaults = this.updateDefaults.bind(this);
  }

  init() {
    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.showCheatsheet",
        this.showCheatsheet
      ),
      vscode.commands.registerCommand(
        "cursorless.internal.updateCheatsheetDefaults",
        this.updateDefaults
      )
    );
  }

  private async showCheatsheet({
    version,
    spokenFormInfo,
    outputPath,
  }: CheatSheetCommandArg) {
    if (version !== 0) {
      throw new Error(`Unsupported cheatsheet api version: ${version}`);
    }

    const cheatsheetPath = path.join(
      this.graph.extensionContext.extensionPath,
      "cursorless-nx",
      "dist",
      "apps",
      "cheatsheet-local",
      "index.html"
    );

    const cheatsheetContent = (await readFile(cheatsheetPath)).toString();

    const root = parse(cheatsheetContent);

    root.getElementById(
      "cheatsheet-data"
    ).textContent = `document.cheatsheetData = ${JSON.stringify(
      spokenFormInfo
    )};`;

    await writeFile(outputPath, root.toString());
  }

  /**
   * Updates the default spoken forms stored in `defaults.json` for
   * development.
   * @param spokenFormInfo The new value to use for default spoken forms.
   */
  private async updateDefaults(spokenFormInfo: unknown) {
    const workspacePath =
      this.graph.extensionContext.extensionMode ===
      vscode.ExtensionMode.Development
        ? this.graph.extensionContext.extensionPath
        : vscode.workspace.workspaceFolders?.[0].uri.path ?? null;

    if (workspacePath == null) {
      throw new Error(
        "Please update defaults from Cursorless workspace or running in debug"
      );
    }

    const defaultsPath = path.join(
      workspacePath,
      "cursorless-nx",
      "libs",
      "cheatsheet",
      "src",
      "lib",
      "data",
      "sampleSpokenFormInfos",
      "defaults.json"
    );

    await writeFile(defaultsPath, JSON.stringify(spokenFormInfo, null, "\t"));
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
