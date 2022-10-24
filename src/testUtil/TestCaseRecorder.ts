import * as fs from "fs";
import { readFile } from "fs/promises";
import { invariant } from "immutability-helper";
import { merge } from "lodash";
import * as path from "path";
import * as vscode from "vscode";
import HatTokenMap from "../core/HatTokenMap";
import { injectSpyIde, SpyInfo } from "../ide/spies/SpyIDE";
import { DecoratedSymbolMark } from "../typings/targetDescriptor.types";
import { Graph } from "../typings/Types";
import { getDocumentRange } from "../util/rangeUtils";
import sleep from "../util/sleep";
import { extractTargetedMarks } from "./extractTargetedMarks";
import serialize from "./serialize";
import { ExtraSnapshotField, takeSnapshot } from "./takeSnapshot";
import { TestCase, TestCaseCommand, TestCaseContext } from "./TestCase";
import { DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST } from "./testConstants";
import { marksToPlainObject, SerializedMarks } from "./toPlainObject";
import { walkDirsSync } from "./walkSync";

const CALIBRATION_DISPLAY_BACKGROUND_COLOR = "#230026";
const CALIBRATION_DISPLAY_DURATION_MS = 50;

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

  /** If true decorations will be added to the test fixture */
  isDecorationsTest?: boolean;

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

  /**
   * Whether to flash a background for calibrating a video recording
   */
  showCalibrationDisplay?: boolean;

  /**
   * Whether we should record a tests which yield errors in addition to tests
   * which do not error.
   */
  recordErrors?: boolean;

  /**
   * Whether to capture the `that` mark returned by the action.
   */
  captureFinalThatMark?: boolean;
}

export class TestCaseRecorder {
  private active: boolean = false;
  private workspacePath: string | null;
  private workspaceName: string | null;
  private fixtureRoot: string | null;
  private targetDirectory: string | null = null;
  private testCase: TestCase | null = null;
  private isHatTokenMapTest: boolean = false;
  private isDecorationsTest: boolean = false;
  private disposables: vscode.Disposable[] = [];
  private isSilent?: boolean;
  private startTimestamp?: bigint;
  private extraSnapshotFields?: ExtraSnapshotField[];
  private paused: boolean = false;
  private isErrorTest: boolean = false;
  /** We use this variable to capture editor settings and then restore them */
  private originalTextEditorOptions: vscode.TextEditorOptions = {};
  private calibrationStyle = vscode.window.createTextEditorDecorationType({
    backgroundColor: CALIBRATION_DISPLAY_BACKGROUND_COLOR,
  });
  private captureFinalThatMark: boolean = false;
  private spyInfo: SpyInfo | undefined;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);

    this.workspacePath =
      graph.extensionContext.extensionMode === vscode.ExtensionMode.Development
        ? graph.extensionContext.extensionPath
        : vscode.workspace.workspaceFolders?.[0].uri.path ?? null;

    this.workspaceName = this.workspacePath
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
              "Stopped recording test cases",
            );
            this.stop();
          } else {
            return await this.start(arg);
          }
        },
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
        },
      ),

      vscode.commands.registerCommand(
        "cursorless.takeSnapshot",
        async (
          outPath: string,
          metadata: unknown,
          targetedMarks: DecoratedSymbolMark[],
          usePrePhraseSnapshot: boolean,
        ) => {
          let marks: SerializedMarks | undefined;
          if (targetedMarks.length !== 0) {
            const keys = targetedMarks.map(({ character, symbolColor }) =>
              HatTokenMap.getKey(symbolColor, character),
            );
            const readableHatMap = await this.graph.hatTokenMap.getReadableMap(
              usePrePhraseSnapshot,
            );
            marks = marksToPlainObject(
              extractTargetedMarks(keys, readableHatMap),
            );
          } else {
            marks = undefined;
          }

          const snapshot = await takeSnapshot(
            undefined,
            undefined,
            ["clipboard"],
            this.active ? this.extraSnapshotFields : undefined,
            marks,
            this.active ? { startTimestamp: this.startTimestamp } : undefined,
            metadata,
          );

          await this.writeToFile(outPath, serialize(snapshot));
        },
      ),
    );
  }

  isActive() {
    return this.active && !this.paused;
  }

  async start(arg?: RecordTestCaseCommandArg) {
    const { directory, ...explicitConfig } = arg ?? {};

    /**
     * A list of paths of every parent directory between the root fixture
     * directory and the user's chosen recording directory
     */
    let parentDirectories: string[];

    if (directory != null) {
      this.targetDirectory = directory;
      parentDirectories = [directory];
    } else {
      this.targetDirectory = (await this.promptSubdirectory()) ?? null;

      if (this.targetDirectory == null) {
        return null;
      }

      const parentNames = path
        .relative(this.fixtureRoot!, this.targetDirectory)
        .split(path.sep);

      parentDirectories = [this.fixtureRoot!];
      let currentDirectory = this.fixtureRoot!;
      for (const name of parentNames) {
        currentDirectory = path.join(currentDirectory, name);
        parentDirectories.push(currentDirectory);
      }
    }

    // Look for a `config.json` file in ancestors of the recording directory,
    // and merge it with the config provided when calling the command.
    const config: RecordTestCaseCommandArg = merge(
      {},
      ...(await Promise.all(
        parentDirectories.map((parent) =>
          readJsonIfExists(path.join(parent, "config.json")),
        ),
      )),
      explicitConfig,
    );

    const {
      isHatTokenMapTest = false,
      isDecorationsTest = false,
      isSilent = false,
      extraSnapshotFields = [],
      showCalibrationDisplay = false,
      recordErrors: isErrorTest = false,
      captureFinalThatMark = false,
    } = config;

    this.active = true;

    const startTimestampISO = await this.recordStartTime(
      showCalibrationDisplay,
    );
    this.isHatTokenMapTest = isHatTokenMapTest;
    this.captureFinalThatMark = captureFinalThatMark;
    this.isDecorationsTest = isDecorationsTest;
    this.isSilent = isSilent;
    this.extraSnapshotFields = extraSnapshotFields;
    this.isErrorTest = isErrorTest;
    this.paused = false;

    vscode.window.showInformationMessage(
      `Recording test cases for following commands in:\n${this.targetDirectory}`,
    );

    return { startTimestampISO };
  }

  private async recordStartTime(showCalibrationDisplay: boolean) {
    if (showCalibrationDisplay) {
      vscode.window.visibleTextEditors.map((editor) => {
        editor.setDecorations(this.calibrationStyle, [
          getDocumentRange(editor.document),
        ]);
      });

      await sleep(CALIBRATION_DISPLAY_DURATION_MS);
    }

    // NB: Record timestamp here so that timestamp is last frame of calibration
    // display
    this.startTimestamp = process.hrtime.bigint();
    const timestampISO = new Date().toISOString();

    if (showCalibrationDisplay) {
      vscode.window.visibleTextEditors.map((editor) => {
        editor.setDecorations(this.calibrationStyle, []);
      });
    }

    return timestampISO;
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
        () => "expected to be awaiting final mark info",
      );
      this.testCase.filterMarks(command, context);
      await this.finishTestCase();
    } else {
      // Otherwise, we are starting a new test case
      this.spyInfo = injectSpyIde(this.graph);

      this.testCase = new TestCase(
        command,
        context,
        this.spyInfo.spy,
        this.isHatTokenMapTest,
        this.isDecorationsTest,
        this.startTimestamp!,
        this.captureFinalThatMark,
        this.extraSnapshotFields,
      );

      await this.testCase.recordInitialState();

      const editor = vscode.window.activeTextEditor!;
      // NB: We need to copy the editor options rather than storing a reference
      // because its properties are lazy
      this.originalTextEditorOptions = { ...editor.options };
      editor.options = DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;
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

    this.testCase = null;
  }

  private async writeToFile(outPath: string, fixture: string) {
    fs.writeFileSync(outPath, fixture);
  }

  private async promptSubdirectory(): Promise<string | undefined> {
    if (
      this.workspaceName == null ||
      this.fixtureRoot == null ||
      !["cursorless-vscode", "cursorless"].includes(this.workspaceName)
    ) {
      throw new Error(
        '"Cursorless record" must be run from within cursorless directory',
      );
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

    const filename = camelize(testCase.command.spokenForm!);
    let filePath = path.join(this.targetDirectory, `${filename}.yml`);

    let i = 2;
    while (fs.existsSync(filePath)) {
      filePath = path.join(this.targetDirectory, `${filename}${i++}.yml`);
    }

    return filePath;
  }

  async commandErrorHook(error: Error) {
    if (this.isErrorTest && this.testCase) {
      this.testCase.thrownError = { name: error.name };
      await this.finishTestCase();
    } else {
      this.testCase = null;
    }
  }

  finallyHook() {
    this.spyInfo?.dispose();
    this.spyInfo = undefined;

    const editor = vscode.window.activeTextEditor!;
    editor.options = this.originalTextEditorOptions;
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());
    this.calibrationStyle.dispose();
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

async function readJsonIfExists(
  path: string,
): Promise<RecordTestCaseCommandArg> {
  let rawText: string;

  try {
    rawText = await readFile(path, { encoding: "utf-8" });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }

    throw err;
  }

  return JSON.parse(rawText);
}
