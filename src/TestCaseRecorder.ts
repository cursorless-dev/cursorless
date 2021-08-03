import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { TestCase } from "./TestCase";
import { walkDirsSync } from "./test/suite/walkSync";

export class TestCaseRecorder {
  active: boolean = false;
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
    await this.writeToFile(outPath, fixture);
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

  private async promptSubdirectory(): Promise<boolean> {
    if (
      this.workspacePath == null ||
      this.fixtureRoot == null ||
      this.workSpaceFolder !== "cursorless-vscode"
    ) {
      throw new Error("Can't prompt for subdirectory");
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
      prompt: "New folder name. Use '/' for subdirectories.",
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

    let filename = camelize(testCase.spokenForm);
    let filePath = path.join(targetDirectory, `${filename}.yml`);

    let i = 2;
    while (fs.existsSync(filePath)) {
      filePath = path.join(targetDirectory, `${filename}${i++}.yml`);
    }

    return filePath;
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
