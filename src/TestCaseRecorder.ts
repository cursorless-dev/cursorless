import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { TestCase } from "./TestCase";
import { walkDirsSync } from "./test/suite/walkSync";

export class TestCaseRecorder {
  active: boolean = false;
  outPath: string | null = null;
  spokenForm: string | null = null;
  workspacePath: string | null;
  workSpaceFolder: string | null;
  fixtureRoot: string | null;
  fixtureSubdirectory: string | null = null;

  constructor(extensionContext: vscode.ExtensionContext) {
    this.workspacePath =
      extensionContext.extensionMode === vscode.ExtensionMode.Development
        ? extensionContext.extensionPath
        : vscode.workspace.workspaceFolders?.[0].uri.path ?? null;

    this.workSpaceFolder = this.workspacePath
      ? path.basename(this.workspacePath)
      : null;

    this.fixtureRoot = this.workspacePath
      ? path.join(this.workspacePath, "src/test/suite/fixtures/recorded")
      : null;
  }

  start(): Promise<void> {
    this.active = true;
    return this.promptSpokenForm();
  }

  async finish(testCase: TestCase): Promise<string | null> {
    this.active = false;
    const outPath = await this.promptSubdirectory();
    const fixture = testCase.toYaml();

    if (outPath) {
      this.writeToFile(outPath, fixture);
    } else {
      this.showFixture(fixture);
    }

    return outPath;
  }

  private async writeToFile(outPath: string, fixture: string) {
    fs.writeFileSync(outPath, fixture);
    vscode.window
      .showInformationMessage("Cursorless test case saved.", "View")
      .then(async (action) => {
        if (action === "View") {
          const document = await vscode.workspace.openTextDocument(outPath);
          await vscode.window.showTextDocument(document);
        }
      });
  }

  private async showFixture(fixture: string) {
    const document = await vscode.workspace.openTextDocument({
      language: "yaml",
      content: fixture,
    });
    await vscode.window.showTextDocument(document, {
      viewColumn: vscode.ViewColumn.Beside,
    });
  }

  private async promptSpokenForm(): Promise<void> {
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

    this.spokenForm = result;
  }

  private async promptSubdirectory(): Promise<string | null> {
    if (
      this.workspacePath == null ||
      this.fixtureRoot == null ||
      this.workSpaceFolder !== "cursorless-vscode"
    ) {
      return null;
    }

    const subdirectories = walkDirsSync(this.fixtureRoot).concat("/");

    const createNewSubdirectory = "Create new folder →";
    const subdirectorySelection = await vscode.window.showQuickPick([
      ...subdirectories,
      createNewSubdirectory,
    ]);

    if (subdirectorySelection === undefined) {
      return null;
    } else if (subdirectorySelection === createNewSubdirectory) {
      return this.promptNewSubdirectory();
    } else {
      this.fixtureSubdirectory = subdirectorySelection;
      return this.promptFileName();
    }
  }

  private async promptNewSubdirectory(): Promise<string | null> {
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

  private async promptFileName(): Promise<string | null> {
    if (this.fixtureRoot == null) {
      throw new Error("Missing fixture root. Not in cursorless workspace?");
    }

    const filename = await vscode.window.showInputBox({
      prompt: "Fixture Filename",
    });

    if (filename === undefined || this.fixtureSubdirectory == null) {
      return this.promptSubdirectory(); // go back a prompt
    }

    const targetDirectory = path.join(
      this.fixtureRoot,
      this.fixtureSubdirectory
    );

    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory);
    }

    this.outPath = path.join(targetDirectory, `${filename}.yml`);
    return this.outPath;
  }
}
