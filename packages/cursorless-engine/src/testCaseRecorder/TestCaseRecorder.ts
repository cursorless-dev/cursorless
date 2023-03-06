import {
  DecoratedSymbolMark,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  extractTargetedMarks,
  ExtraSnapshotField,
  getKey,
  IDE,
  marksToPlainObject,
  serialize,
  SerializedMarks,
  showInfo,
  sleep,
  SpyIDE,
  TextEditorOptions,
  toLineRange,
  walkDirsSync,
} from "@cursorless/common";
import * as fs from "fs";
import { readFile } from "fs/promises";
import { invariant } from "immutability-helper";
import { merge } from "lodash";
import * as path from "path";
import { ide, injectIde } from "../singletons/ide.singleton";
import { takeSnapshot } from "../testUtil/takeSnapshot";
import { Graph } from "../typings/Graph";
import { TestCase, TestCaseContext } from "./TestCase";
import { TestCaseCommand } from "@cursorless/common";

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

const TIMING_CALIBRATION_HIGHLIGHT_ID = "timingCalibration";

export class TestCaseRecorder {
  private active: boolean = false;
  private workspacePath: string | null;
  private workspaceName: string | null;
  private fixtureRoot: string | null;
  private targetDirectory: string | null = null;
  private testCase: TestCase | null = null;
  private isHatTokenMapTest: boolean = false;
  private isDecorationsTest: boolean = false;
  private isSilent?: boolean;
  private startTimestamp?: bigint;
  private extraSnapshotFields?: ExtraSnapshotField[];
  private paused: boolean = false;
  private isErrorTest: boolean = false;
  /** We use this variable to capture editor settings and then restore them */
  private originalTextEditorOptions: TextEditorOptions = {};
  private captureFinalThatMark: boolean = false;
  private spyIde: SpyIDE | undefined;
  private originalIde: IDE | undefined;

  constructor(private graph: Graph) {
    const { runMode, assetsRoot, workspaceFolders } = ide();

    this.workspacePath =
      runMode === "development"
        ? assetsRoot
        : workspaceFolders?.[0].uri.path ?? null;

    this.workspaceName = this.workspacePath
      ? path.basename(this.workspacePath)
      : null;

    this.fixtureRoot = this.workspacePath
      ? path.join(
          this.workspacePath,
          "packages/cursorless-vscode-e2e/suite/fixtures/recorded",
        )
      : null;

    this.toggle = this.toggle.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
  }

  async toggle(arg?: RecordTestCaseCommandArg) {
    if (this.active) {
      showInfo(ide().messages, "recordStop", "Stopped recording test cases");
      this.stop();
    } else {
      return await this.start(arg);
    }
  }
  async pause() {
    if (!this.active) {
      throw Error("Asked to pause recording, but no recording active");
    }

    this.paused = true;
  }

  async resume() {
    if (!this.active) {
      throw Error("Asked to resume recording, but no recording active");
    }

    this.paused = false;
  }

  async takeSnapshot(
    outPath: string,
    metadata: unknown,
    targetedMarks: DecoratedSymbolMark[],
    usePrePhraseSnapshot: boolean,
  ) {
    let marks: SerializedMarks | undefined;
    if (targetedMarks.length !== 0) {
      const keys = targetedMarks.map(({ character, symbolColor }) =>
        getKey(symbolColor, character),
      );
      const readableHatMap = await this.graph.hatTokenMap.getReadableMap(
        usePrePhraseSnapshot,
      );
      marks = marksToPlainObject(extractTargetedMarks(keys, readableHatMap));
    } else {
      marks = undefined;
    }

    const snapshot = await takeSnapshot(
      undefined,
      undefined,
      ["clipboard"],
      this.active ? this.extraSnapshotFields : undefined,
      ide().activeTextEditor!,
      ide(),
      marks,
      this.active ? { startTimestamp: this.startTimestamp } : undefined,
      metadata,
    );

    await this.writeToFile(outPath, serialize(snapshot));
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

    showInfo(
      ide().messages,
      "recordStart",
      `Recording test cases for following commands in:\n${this.targetDirectory}`,
    );

    return { startTimestampISO };
  }

  private async recordStartTime(showCalibrationDisplay: boolean) {
    if (showCalibrationDisplay) {
      await Promise.all(
        ide().visibleTextEditors.map((editor) =>
          ide().setHighlightRanges(TIMING_CALIBRATION_HIGHLIGHT_ID, editor, [
            toLineRange(editor.document.range),
          ]),
        ),
      );

      await sleep(CALIBRATION_DISPLAY_DURATION_MS);
    }

    // NB: Record timestamp here so that timestamp is last frame of calibration
    // display
    this.startTimestamp = process.hrtime.bigint();
    const timestampISO = new Date().toISOString();

    if (showCalibrationDisplay) {
      await Promise.all(
        ide().visibleTextEditors.map((editor) =>
          ide().setHighlightRanges(TIMING_CALIBRATION_HIGHLIGHT_ID, editor, []),
        ),
      );
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
      this.originalIde = ide();
      this.spyIde = new SpyIDE(this.originalIde);
      injectIde(this.spyIde!);

      this.testCase = new TestCase(
        command,
        context,
        this.spyIde,
        this.isHatTokenMapTest,
        this.isDecorationsTest,
        this.startTimestamp!,
        this.captureFinalThatMark,
        this.extraSnapshotFields,
      );

      await this.testCase.recordInitialState();

      const editor = ide().activeTextEditor!;
      // NB: We need to copy the editor options rather than storing a reference
      // because its properties are lazy
      this.originalTextEditorOptions = { ...editor.options };
      ide().getEditableTextEditor(editor).options =
        DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;
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
      showInfo(
        ide().messages,
        "testCaseSaved",
        "Cursorless test case saved.",
        "View",
      ).then(async (action) => {
        if (action === "View") {
          await ide().openTextDocument(outPath);
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

    const subdirectorySelection = await ide().showQuickPick(
      walkDirsSync(this.fixtureRoot).concat("/"),
      {
        title: "Select directory for new test cases",
        unknownValues: {
          allowed: true,
          newValueTemplate: "Create new directory '{}' →",
        },
      },
    );

    if (subdirectorySelection == null) {
      return undefined;
    }

    return path.join(this.fixtureRoot, subdirectorySelection);
  }

  private calculateFilePath(testCase: TestCase): string {
    if (this.targetDirectory == null) {
      throw new Error("Target directory isn't defined");
    }

    if (!fs.existsSync(this.targetDirectory)) {
      fs.mkdirSync(this.targetDirectory, { recursive: true });
    }

    const filename = camelize(testCase.command.spokenForm ?? "command");
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
    injectIde(this.originalIde!);
    this.spyIde = undefined;
    this.originalIde = undefined;

    const editor = ide().activeTextEditor!;
    ide().getEditableTextEditor(editor).options =
      this.originalTextEditorOptions;
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
