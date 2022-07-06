import * as vscode from "vscode";
import { Graph } from "../typings/Types";
import { readFile, writeFile } from "fs/promises";
import path = require("path");
import parse from "node-html-parser";

type SpokenFormInfo = unknown;

export default class Cheatsheet {
  private disposables: vscode.Disposable[] = [];

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
  }

  init() {
    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.showCheatsheet",
        async (spokenFormInfo: SpokenFormInfo, outputPath: string) => {
          const cheatsheetPath = path.join(
            this.graph.extensionContext.extensionPath,
            "dist",
            "assets",
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
      )
    );
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
