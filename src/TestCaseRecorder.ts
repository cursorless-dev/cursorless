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

  async start(): Promise<boolean> {
    this.active = await this.promptSubdirectory();
    return this.active;
  }

  stop() {
    this.active = false;
  }

  async finish(testCase: TestCase): Promise<void> {
    const outPath = this.calculateFilePath(testCase);
    const fixture = testCase.toYaml();

    if (outPath) {
      this.writeToFile(outPath, fixture);
    } else {
      this.showFixture(fixture);
    }
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

  private async promptSubdirectory(): Promise<boolean> {
    if (
      this.workspacePath == null ||
      this.fixtureRoot == null ||
      this.workSpaceFolder !== "cursorless-vscode"
    ) {
      return false;
    }

    const subdirectories = walkDirsSync(this.fixtureRoot).concat("/");

    const createNewSubdirectory = "Create new folder →";
    const subdirectorySelection = await vscode.window.showQuickPick([
      ...subdirectories,
      createNewSubdirectory,
    ]);

    if (subdirectorySelection === undefined) {
      return false;
    } else if (subdirectorySelection === createNewSubdirectory) {
      return this.promptNewSubdirectory();
    } else {
      this.fixtureSubdirectory = subdirectorySelection;
      return true;
    }
  }

  private async promptNewSubdirectory(): Promise<boolean> {
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
    return true;
  }

  private calculateFilePath(testCase: TestCase): string {
    if (this.fixtureRoot == null) {
      throw new Error("Missing fixture root. Not in cursorless workspace?");
    }

    const targetDirectory = path.join(
      this.fixtureRoot,
      this.fixtureSubdirectory!
    );

    if (!fs.existsSync(targetDirectory)) {
      fs.mkdirSync(targetDirectory);
    }

    const filename = camelize(testCase.spokenForm);
    this.outPath = path.join(targetDirectory, `${filename}.yml`);
    return this.outPath;
  }
}

function camelize(str: string) {
  return str
    .split(" ")
    .map((str, index) => (index === 0 ? str : capitalize(str)))
    .join("");
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
