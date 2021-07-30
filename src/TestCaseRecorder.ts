import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class TestCaseRecorder {
  active: boolean = false;
  outPath: string | null = null;
  talonCommand: string | null = null;
  workspacePath: string | null;
  workSpaceFolder: string | null;
  fixtureRoot: string | null;
  fixtureSubdirectory: string | null = null;

  constructor() {
    this.workspacePath =
      vscode.workspace.workspaceFolders?.[0].uri.path ?? null;

    this.workSpaceFolder = this.workspacePath
      ? path.basename(this.workspacePath)
      : null;

    this.fixtureRoot = this.workspacePath
      ? path.join(this.workspacePath, "src/test/suite/fixtures/recorded")
      : null;
  }

  start(): Promise<void> {
    return this.promptTalonCommand();
  }

  private async promptTalonCommand(): Promise<void> {
    const result = await vscode.window.showInputBox({
      prompt: "Talon Command",
      ignoreFocusOut: true,
      validateInput: (input) => (input.trim().length > 0 ? null : "Required"),
    });

    // Inputs return undefined when a user cancels by hitting 'escape'
    if (result === undefined) {
      this.active = false;
      return;
    }

    this.talonCommand = result;
    return this.promptSubdirectory();
  }

  private async promptSubdirectory(): Promise<void> {
    if (
      this.workspacePath == null ||
      this.fixtureRoot == null ||
      this.workSpaceFolder !== "cursorless-vscode"
    ) {
      return;
    }

    const subdirectories = fs
      .readdirSync(this.fixtureRoot, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((directory) => directory.name);

    const createNewSubdirectory = "Create new folder →";
    const subdirectorySelection = await vscode.window.showQuickPick([
      ...subdirectories,
      createNewSubdirectory,
    ]);

    if (subdirectorySelection === undefined) {
      return this.promptTalonCommand(); // go back a prompt
    } else if (subdirectorySelection === createNewSubdirectory) {
      return this.promptNewSubdirectory();
    } else {
      this.fixtureSubdirectory = subdirectorySelection;
      return this.promptFileName();
    }
  }

  private async promptNewSubdirectory(): Promise<void> {
    if (this.fixtureRoot == null) {
      throw new Error("Missing fixture root. Not in cursorless workspace?");
    }

    const subdirectory = await vscode.window.showInputBox({
      prompt: "New Folder Name",
      ignoreFocusOut: true,
      validateInput: (input) => (input.trim().length > 0 ? null : "Required"),
    });

    if (subdirectory === undefined) {
      return this.promptSubdirectory(); // go back a prompt
    }

    this.fixtureSubdirectory = subdirectory;
    return this.promptFileName();
  }

  private async promptFileName(): Promise<void> {
    if (this.fixtureRoot == null) {
      throw new Error("Missing fixture root. Not in cursorless workspace?");
    }

    const filename = await vscode.window.showInputBox({
      prompt: "Fixture Filename",
    });

    if (filename === undefined || this.fixtureSubdirectory == null) {
      this.promptSubdirectory(); // go back a prompt
      return;
    }

    const targetDirectory = path.join(
      this.fixtureRoot,
      this.fixtureSubdirectory,
      `${filename}.yml`
    );

    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory);
    }

    this.outPath = path.join(targetDirectory, `${filename}.yml`);
  }
}
