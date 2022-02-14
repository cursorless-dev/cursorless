import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { TestCase, TestCaseCommand, TestCaseContext } from "./TestCase";
import { walkDirsSync } from "./walkSync";
import { invariant } from "immutability-helper";
import { Graph } from "../typings/Types";
import { ExtraSnapshotField } from "./takeSnapshot";

interface RecordTestCaseCommandArg {
  /**
   * If this is set to `true`, then for each test case that we record, we expect
   * that the user will issue a second command in each phrase, which refers to a
   * decorated mark whose range we'd like to check that it got updated properly
   * during the previous command. We use this functionality in order to check
   * that the token range update works properly. For example, you might say
   * `"chuck second car ox air take air"` to check that removing a character
   * from a token properly updates the token.
   */
  isHatTokenMapTest?: boolean;

  /**
   * The directory in which to store the test cases that we record. If left out
   * the user will be prompted to select a directory within the default recorded
   * test case directory.
   */
  directory?: string;

  /**
   * If `true`, don't show a little pop up each time to indicate we've recorded a
   * test case
   */
  isSilent?: boolean;

  extraSnapshotFields?: ExtraSnapshotField[];
}

export class TestCaseRecorder {
  private active: boolean = false;
  private workspacePath: string | null;
  private workSpaceFolder: string | null;
  private fixtureRoot: string | null;
  private targetDirectory: string | null = null;
  private testCase: TestCase | null = null;
  private isHatTokenMapTest: boolean = false;
  private disposables: vscode.Disposable[] = [];
  private isSilent?: boolean;
  private startTimestamp?: bigint;
  private extraSnapshotFields?: ExtraSnapshotField[];
  private paused: boolean = false;

  constructor(graph: Graph) {
    graph.extensionContext.subscriptions.push(this);

    this.workspacePath =
      graph.extensionContext.extensionMode === vscode.ExtensionMode.Development
        ? graph.extensionContext.extensionPath
        : vscode.workspace.workspaceFolders?.[0].uri.path ?? null;

    this.workSpaceFolder = this.workspacePath
      ? path.basename(this.workspacePath)
      : null;

    this.fixtureRoot = this.workspacePath
      ? path.join(this.workspacePath, "src/test/suite/fixtures/recorded")
      : null;
  }

  init() {
    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.recordTestCase",
        async (arg?: RecordTestCaseCommandArg) => {
          if (this.active) {
            vscode.window.showInformationMessage(
              "Stopped recording test cases"
            );
            this.stop();
          } else {
            if (await this.start(arg)) {
              vscode.window.showInformationMessage(
                `Recording test cases for following commands in:\n${this.targetDirectory}`
              );
            }
          }
        }
      ),

      vscode.commands.registerCommand("cursorless.pauseRecording", async () => {
        if (!this.active) {
          throw Error("Asked to pause recording, but no recording active");
        }

        this.paused = true;
      }),

      vscode.commands.registerCommand(
        "cursorless.resumeRecording",
        async () => {
          if (!this.active) {
            throw Error("Asked to resume recording, but no recording active");
          }

          this.paused = false;
        }
      )
    );
  }

  isActive() {
    return this.active && !this.paused;
  }

  async start(arg?: RecordTestCaseCommandArg): Promise<boolean> {
    const {
      isHatTokenMapTest = false,
      directory,
      isSilent = false,
      extraSnapshotFields = [],
    } = arg ?? {};

    if (directory != null) {
      this.targetDirectory = directory;
    } else {
      this.targetDirectory = (await this.promptSubdirectory()) ?? null;
    }

    this.active = this.targetDirectory != null;

    if (this.active) {
      this.isHatTokenMapTest = isHatTokenMapTest;
      this.isSilent = isSilent;
      this.extraSnapshotFields = extraSnapshotFields;
      this.startTimestamp = process.hrtime.bigint();
      this.paused = false;
    }

    return this.active;
  }

  stop() {
    this.active = false;
    this.paused = false;
  }

  async preCommandHook(command: TestCaseCommand, context: TestCaseContext) {
    if (this.testCase != null) {
      // If testCase is not null and we are just before a command, this means
      // that this command is the follow up command indicating which marks we
      // cared about from the last command
      invariant(
        this.testCase.awaitingFinalMarkInfo,
        () => "expected to be awaiting final mark info"
      );
      this.testCase.filterMarks(command, context);
      await this.finishTestCase();
    } else {
      // Otherwise, we are starting a new test case
      this.testCase = new TestCase(
        command,
        context,
        this.isHatTokenMapTest,
        this.startTimestamp!,
        this.extraSnapshotFields
      );
      await this.testCase.recordInitialState();
    }
  }

  async postCommandHook(returnValue: any) {
    if (this.testCase == null) {
      // If test case is null then this means that this was just a follow up
      // command for a navigation map test
      return;
    }

    await this.testCase.recordFinalState(returnValue);

    if (this.testCase.awaitingFinalMarkInfo) {
      // We don't finish the test case here in the case of a navigation map
      // test because we'll do it after we get the follow up command indicating
      // which marks we wanted to track
      return;
    }

    await this.finishTestCase();
  }

  async finishTestCase(): Promise<void> {
    const outPath = this.calculateFilePath(this.testCase!);
    const fixture = this.testCase!.toYaml();
    await this.writeToFile(outPath, fixture);
    this.testCase = null;
  }

  private async writeToFile(outPath: string, fixture: string) {
    fs.writeFileSync(outPath, fixture);
    if (!this.isSilent) {
      vscode.window
        .showInformationMessage("Cursorless test case saved.", "View")
        .then(async (action) => {
          if (action === "View") {
            const document = await vscode.workspace.openTextDocument(outPath);
            await vscode.window.showTextDocument(document);
          }
        });
    }
  }

  private async promptSubdirectory(): Promise<string | undefined> {
    if (
      this.workspacePath == null ||
      this.fixtureRoot == null ||
      this.workSpaceFolder !== "cursorless-vscode"
    ) {
      throw new Error("Can't prompt for subdirectory");
    }

    const subdirectories = walkDirsSync(this.fixtureRoot).concat("/");

    const createNewSubdirectory = "Create new folder →";
    let subdirectorySelection: string | undefined =
      await vscode.window.showQuickPick([
        ...subdirectories,
        createNewSubdirectory,
      ]);

    if (subdirectorySelection === createNewSubdirectory) {
      subdirectorySelection = await this.promptNewSubdirectory();
    }

    if (subdirectorySelection == null) {
      return undefined;
    }

    return path.join(this.fixtureRoot, subdirectorySelection);
  }

  private async promptNewSubdirectory(): Promise<string | undefined> {
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

    return subdirectory;
  }

  private calculateFilePath(testCase: TestCase): string {
    if (this.targetDirectory == null) {
      throw new Error("Target directory isn't defined");
    }

    if (!fs.existsSync(this.targetDirectory)) {
      fs.mkdirSync(this.targetDirectory, { recursive: true });
    }

    let filename = camelize(testCase.command.spokenForm!);
    let filePath = path.join(this.targetDirectory, `${filename}.yml`);

    let i = 2;
    while (fs.existsSync(filePath)) {
      filePath = path.join(this.targetDirectory, `${filename}${i++}.yml`);
    }

    return filePath;
  }

  commandErrorHook() {
    this.testCase = null;
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
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
