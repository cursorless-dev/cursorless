import {
  CommandComplete,
  CommandLatest,
  CommandResponse,
  CommandServerApi,
  DecoratedSymbolMark,
  DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST,
  extractTargetedMarks,
  ExtraSnapshotField,
  getKey,
  getRecordedTestsDirPath,
  HatTokenMap,
  IDE,
  marksToPlainObject,
  ReadOnlyHatMap,
  serialize,
  SerializedMarks,
  showError,
  showInfo,
  sleep,
  SpyIDE,
  TextEditorOptions,
  toLineRange,
  walkDirsSync,
} from "@cursorless/common";
import * as fs from "fs";
import { access, readFile } from "fs/promises";
import { invariant } from "immutability-helper";
import { merge } from "lodash-es";
import * as path from "pathe";
import { CommandRunner } from "../CommandRunner";
import { StoredTargetMap } from "../core/StoredTargets";
import { SpokenFormGenerator } from "../generateSpokenForm";
import { ide, injectIde } from "../singletons/ide.singleton";
import { defaultSpokenFormMap } from "../spokenForms/defaultSpokenFormMap";
import { takeSnapshot } from "../testUtil/takeSnapshot";
import { RecordTestCaseCommandOptions } from "./RecordTestCaseCommandOptions";
import { TestCase } from "./TestCase";

const CALIBRATION_DISPLAY_DURATION_MS = 50;

const TIMING_CALIBRATION_HIGHLIGHT_ID = "timingCalibration";

/**
 * Used for recording test cases
 */
export class TestCaseRecorder {
  private active: boolean = false;
  private pauseAfterNextCommand: boolean = false;
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
  private spokenFormGenerator = new SpokenFormGenerator(defaultSpokenFormMap);

  constructor(
    private commandServerApi: CommandServerApi | undefined,
    private hatTokenMap: HatTokenMap,
    private storedTargets: StoredTargetMap,
  ) {
    const { runMode } = ide();

    this.fixtureRoot =
      runMode === "development" || runMode === "test"
        ? getRecordedTestsDirPath()
        : null;

    this.toggle = this.toggle.bind(this);
    this.recordOneThenPause = this.recordOneThenPause.bind(this);
    this.pause = this.pause.bind(this);
    this.resume = this.resume.bind(this);
    this.takeSnapshot = this.takeSnapshot.bind(this);
  }

  async toggle(options?: RecordTestCaseCommandOptions) {
    if (this.active) {
      showInfo(ide().messages, "recordStop", "Stopped recording test cases");
      this.stop();
    } else {
      return await this.start(options);
    }
  }

  async recordOneThenPause(options?: RecordTestCaseCommandOptions) {
    this.pauseAfterNextCommand = true;
    this.paused = false;
    if (!this.active) {
      return await this.start(options);
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
      const readableHatMap =
        await this.hatTokenMap.getReadableMap(usePrePhraseSnapshot);
      marks = marksToPlainObject(extractTargetedMarks(keys, readableHatMap));
    } else {
      marks = undefined;
    }

    const snapshot = await takeSnapshot(
      undefined,
      ["clipboard"],
      this.active ? this.extraSnapshotFields : undefined,
      ide().activeTextEditor,
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

  async start(options?: RecordTestCaseCommandOptions) {
    const { directory, ...explicitConfig } = options ?? {};

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
    const config: RecordTestCaseCommandOptions = merge(
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
    this.pauseAfterNextCommand = false;
  }

  async preCommandHook(hatTokenMap: ReadOnlyHatMap, command: CommandLatest) {
    if (this.testCase != null) {
      // If testCase is not null and we are just before a command, this means
      // that this command is the follow up command indicating which marks we
      // cared about from the last command
      invariant(
        this.testCase.awaitingFinalMarkInfo,
        () => "expected to be awaiting final mark info",
      );
      this.testCase.filterMarks();
      await this.finishTestCase();
    } else {
      // Otherwise, we are starting a new test case
      this.originalIde = ide();
      this.spyIde = new SpyIDE(this.originalIde);
      injectIde(this.spyIde);

      const spokenForm = this.spokenFormGenerator.processCommand(command);

      this.testCase = new TestCase(
        {
          ...command,

          // If spoken form is an error, we just use the spoken form that they
          // actually used. If it is a success, we use the first spoken form
          // that from our generator, which will almost always be the only spoken
          // form. If there are multiple, there will be a test failure so we can
          // cross that bridge if it happens.
          spokenForm:
            spokenForm.type === "success"
              ? spokenForm.spokenForms[0]
              : command.spokenForm,
        },
        await this.commandServerApi?.getFocusedElementType(),
        hatTokenMap,
        this.storedTargets,
        this.spyIde,
        this.isHatTokenMapTest,
        this.isDecorationsTest,
        this.startTimestamp!,
        this.captureFinalThatMark,
        this.extraSnapshotFields,
        spokenForm.type === "error" ? spokenForm.reason : undefined,
      );

      await this.testCase.recordInitialState();

      const editor = ide().activeTextEditor!;

      if (editor.document.getText().includes("\r\n")) {
        throw Error(
          "Refusing to record a test when the document contains CRLF line endings.  Please convert line endings to LF.",
        );
      }

      // NB: We need to copy the editor options rather than storing a reference
      // because its properties are lazy
      this.originalTextEditorOptions = { ...editor.options };
      ide().getEditableTextEditor(editor).options =
        DEFAULT_TEXT_EDITOR_OPTIONS_FOR_TEST;
    }
  }

  async postCommandHook(returnValue: CommandResponse) {
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
      let message = `"${
        this.testCase!.command.spokenForm
      }" Cursorless test case saved.`;

      if (this.testCase!.spokenFormError != null) {
        message += ` Spoken form error: ${this.testCase!.spokenFormError}`;
      }

      showInfo(ide().messages, "testCaseSaved", message, "View", "Delete").then(
        async (action) => {
          if (action === "View") {
            await ide().openTextDocument(outPath);
          }
          if (action === "Delete") {
            await fs.unlink(outPath, (err) => {
              if (err) {
                console.log(`failed to delete ${outPath}: ${err}`);
              } else {
                console.log(`deleted ${outPath}`);
              }
            });
          }
        },
      );
    }

    this.testCase = null;
    if (this.pauseAfterNextCommand) {
      this.paused = true;
      this.pauseAfterNextCommand = false;
    }
  }

  private async writeToFile(outPath: string, fixture: string) {
    fs.writeFileSync(outPath, fixture);
  }

  private async promptSubdirectory(): Promise<string | undefined> {
    try {
      if (this.fixtureRoot == null) {
        throw Error();
      }
      await access(this.fixtureRoot);
    } catch (err) {
      const errorMessage =
        '"Cursorless record" must be run from within cursorless directory';
      showError(ide().messages, "promptSubdirectoryError", errorMessage);
      throw new Error(errorMessage);
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
    if (this.originalIde != null) {
      injectIde(this.originalIde);
    }
    this.spyIde = undefined;
    this.originalIde = undefined;

    const editor = ide().activeTextEditor!;
    ide().getEditableTextEditor(editor).options =
      this.originalTextEditorOptions;
  }

  wrapCommandRunner(
    readableHatMap: ReadOnlyHatMap,
    runner: CommandRunner,
  ): CommandRunner {
    if (!this.isActive()) {
      return runner;
    }
    return {
      run: async (commandComplete: CommandComplete) => {
        try {
          await this.preCommandHook(readableHatMap, commandComplete);

          const returnValue = await runner.run(commandComplete);

          await this.postCommandHook(returnValue);

          return returnValue;
        } catch (e) {
          await this.commandErrorHook(e as Error);
          throw e;
        } finally {
          this.finallyHook();
        }
      },
    };
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
): Promise<RecordTestCaseCommandOptions> {
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
