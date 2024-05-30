import {
  CommandComplete,
  Disposable,
  Notifier,
  ReadOnlyHatMap,
  ScopeType,
  TextEditor,
  TutorialId,
  TutorialInfo,
  TutorialState,
  plainObjectToRange,
  plainObjectToSelection,
  serializedMarksToTokenHats,
  toCharacterRange,
} from "@cursorless/common";
import path from "path";
import { CommandRunner } from "../CommandRunner";
import { CommandRunnerDecorator } from "../api/CursorlessEngineApi";
import { Tutorial, TutorialContent, TutorialStep } from "../api/Tutorial";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { ide } from "../singletons/ide.singleton";
import { HatTokenMapImpl } from "./HatTokenMapImpl";
import { TutorialError, TutorialScriptParser } from "./TutorialScriptParser";
import { loadTutorialScript } from "./loadTutorialScript";
import { isEqual } from "lodash";
import { Debouncer } from "./Debouncer";
import { readdir } from "node:fs/promises";
import { produce } from "immer";

const HIGHLIGHT_COLOR = "highlight0";

export class TutorialImpl implements Tutorial, CommandRunnerDecorator {
  private tutorialRootDir: string;
  private editor?: TextEditor;
  private state_: TutorialState = { type: "loading" };
  private notifier: Notifier<[TutorialState]> = new Notifier();
  private currentTutorial: TutorialContent | undefined;
  private disposables: Disposable[] = [];
  private tutorials!: TutorialInfo[];

  constructor(
    private hatTokenMap: HatTokenMapImpl,
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
  ) {
    this.setupStep = this.setupStep.bind(this);
    this.reparseCurrentTutorial = this.reparseCurrentTutorial.bind(this);
    const debouncer = new Debouncer(() => this.checkPreconditions(), 100);

    this.tutorialRootDir = path.join(ide().assetsRoot, "tutorial");

    this.loadTutorialList();

    this.disposables.push(
      ide().onDidChangeActiveTextEditor(debouncer.run),
      ide().onDidChangeTextDocument(debouncer.run),
      ide().onDidChangeVisibleTextEditors(debouncer.run),
      ide().onDidChangeTextEditorSelection(debouncer.run),
      ide().onDidOpenTextDocument(debouncer.run),
      ide().onDidCloseTextDocument(debouncer.run),
      ide().onDidChangeTextEditorVisibleRanges(debouncer.run),
      customSpokenFormGenerator.onDidChangeCustomSpokenForms(
        this.reparseCurrentTutorial,
      ),
      debouncer,
    );
  }

  /**
   * This function is called when a scope type is visualized. If the current step
   * is waiting for a visualization of the given scope type, the tutorial will
   * advance to the next step.
   * @param scopeType The scope type that was visualized
   */
  scopeTypeVisualized(scopeType: ScopeType | undefined): void {
    if (this.state_.type === "doingTutorial") {
      const currentStep = this.currentTutorial!.steps[this.state_.stepNumber];
      if (
        currentStep.trigger?.type === "visualize" &&
        isEqual(currentStep.trigger.scopeType, scopeType)
      ) {
        this.next();
      }
    }
  }

  async loadTutorialList() {
    const tutorialDirs = await readdir(this.tutorialRootDir, {
      withFileTypes: true,
    });

    const tutorialProgress = ide().globalState.get("tutorialProgress");

    this.tutorials = await Promise.all(
      tutorialDirs
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const tutorialId = dirent.name as TutorialId;
          const rawContent = await loadTutorialScript(
            this.tutorialRootDir,
            tutorialId,
          );

          return {
            id: tutorialId,
            title: rawContent.title,
            version: rawContent.version,
            stepCount: rawContent.steps.length,
            currentStep: tutorialProgress[tutorialId]?.currentStep ?? 0,
          };
        }),
    );

    this.setState({
      type: "pickingTutorial",
      tutorials: this.tutorials,
    });
  }

  dispose() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  wrapCommandRunner(
    _readableHatMap: ReadOnlyHatMap,
    commandRunner: CommandRunner,
  ): CommandRunner {
    if (this.state_.type !== "doingTutorial") {
      return commandRunner;
    }

    const currentStep = this.currentTutorial?.steps[this.state_.stepNumber];

    if (currentStep?.trigger?.type !== "command") {
      return commandRunner;
    }

    const trigger = currentStep.trigger;

    return {
      run: async (commandComplete: CommandComplete) => {
        const returnValue = await commandRunner.run(commandComplete);

        if (isEqual(trigger.command.action, commandComplete.action)) {
          await this.next();
        }

        return returnValue;
      },
    };
  }

  public onState(callback: (state: TutorialState) => void): Disposable {
    return this.notifier.registerListener(callback);
  }

  private async reparseCurrentTutorial() {
    if (this.currentTutorial == null || this.state_.type !== "doingTutorial") {
      return;
    }

    const tutorialId = this.state_.id;

    const rawContent = await loadTutorialScript(
      this.tutorialRootDir,
      tutorialId,
    );

    const parser = new TutorialScriptParser(
      this.tutorialRootDir,
      tutorialId,
      this.customSpokenFormGenerator,
    );

    try {
      const hadErrors = this.state_.hasErrors;

      this.currentTutorial.steps = await Promise.all(
        rawContent.steps.map(parser.parseTutorialStep),
      );

      this.setState({
        ...this.state_,
        hasErrors: false,
        stepContent: this.currentTutorial.steps[this.state_.stepNumber].content,
        stepCount: this.currentTutorial.steps.length,
      });

      if (hadErrors) {
        await this.setupStep();
      }
    } catch (err) {
      this.currentTutorial.steps = [];
      this.setState({
        ...this.state_,
        hasErrors: true,
        requiresTalonUpdate:
          err instanceof TutorialError && err.requiresTalonUpdate,
      });
    }
  }

  async start(tutorialId: TutorialId | number): Promise<void> {
    if (typeof tutorialId === "number") {
      tutorialId = this.tutorials[tutorialId].id;
    }

    const rawContent = await loadTutorialScript(
      this.tutorialRootDir,
      tutorialId,
    );

    const parser = new TutorialScriptParser(
      this.tutorialRootDir,
      tutorialId,
      this.customSpokenFormGenerator,
    );

    try {
      this.currentTutorial = {
        title: rawContent.title,
        version: rawContent.version,
        steps: await Promise.all(
          rawContent.steps.map(parser.parseTutorialStep),
        ),
      };

      let stepNumber =
        ide().globalState.get("tutorialProgress")[tutorialId]?.currentStep ?? 0;

      if (stepNumber >= this.currentTutorial.steps.length - 1) {
        stepNumber = 0;
      }

      this.setState({
        type: "doingTutorial",
        hasErrors: false,
        id: tutorialId,
        stepNumber,
        stepContent: this.currentTutorial.steps[stepNumber].content,
        stepCount: this.currentTutorial.steps.length,
        title: this.currentTutorial.title,
        preConditionsMet: true,
      });
    } catch (err) {
      this.currentTutorial = {
        title: rawContent.title,
        steps: [],
        version: rawContent.version,
      };
      this.setState({
        type: "doingTutorial",
        hasErrors: true,
        id: tutorialId,
        stepNumber: 0,
        title: this.currentTutorial.title,
        preConditionsMet: true,
        requiresTalonUpdate:
          err instanceof TutorialError && err.requiresTalonUpdate,
      });
    }

    await this.setupStep();
  }

  docsOpened() {
    if (this.state_.type === "doingTutorial") {
      const currentStep = this.currentTutorial!.steps[this.state_.stepNumber];
      if (currentStep.trigger?.type === "help") {
        this.next();
      }
    }
  }

  private async changeStep(
    getStep: (current: number) => number,
  ): Promise<void> {
    if (this.state_.type === "doingTutorial" && !this.state_.hasErrors) {
      const newStepNumber = getStep(this.state_.stepNumber);

      if (newStepNumber === this.state_.stepCount || newStepNumber < 0) {
        await this.loadTutorialList();
      } else {
        const nextStep = this.currentTutorial!.steps[newStepNumber];

        this.setState({
          type: "doingTutorial",
          hasErrors: false,
          id: this.state_.id,
          stepNumber: newStepNumber,
          stepContent: nextStep.content,
          stepCount: this.state_.stepCount,
          title: this.state_.title,
          preConditionsMet: true,
        });
      }
    }

    await this.setupStep();
  }

  next() {
    return this.changeStep((current) => current + 1);
  }

  previous() {
    return this.changeStep((current) => current - 1);
  }

  restart() {
    return this.changeStep(() => 0);
  }

  resume() {
    return this.setupStep();
  }

  async list() {
    await this.loadTutorialList();

    await this.setupStep();
  }

  private setState(state: TutorialState) {
    this.state_ = state;

    if (state.type === "doingTutorial") {
      ide().globalState.set(
        "tutorialProgress",
        produce(ide().globalState.get("tutorialProgress"), (draft) => {
          draft[state.id] = {
            currentStep: state.stepNumber,
            version: this.currentTutorial!.version,
          };
        }),
      );
    }

    this.notifier.notifyListeners(state);
  }

  get state() {
    return this.state_;
  }

  /**
   * Handle the "cursorless.tutorial.setupStep" command
   * @see packages/cursorless-vscode-e2e/src/suite/recorded.vscode.test.ts
   */
  private async setupStep(retry = true) {
    if (this.state_.type !== "doingTutorial") {
      if (this.editor != null) {
        ide().setHighlightRanges(HIGHLIGHT_COLOR, this.editor, []);
        this.editor = undefined;
      }
      return;
    }

    const { initialState: snapshot, languageId = "plaintext" } =
      this.currentTutorial!.steps[this.state_.stepNumber];

    if (snapshot == null) {
      if (this.editor != null) {
        ide().setHighlightRanges(HIGHLIGHT_COLOR, this.editor, []);
      }
      return;
    }

    try {
      if (this.editor == null) {
        this.editor = await ide().openUntitledTextDocument({
          content: snapshot.documentContents,
          language: languageId,
        });
        retry = false;
      }

      const editableEditor = ide().getEditableTextEditor(this.editor);

      if (editableEditor.document.languageId !== languageId) {
        throw new Error(
          `Expected language id ${languageId}, but got ${editableEditor.document.languageId}`,
        );
      }

      await editableEditor.edit([
        {
          range: editableEditor.document.range,
          text: snapshot.documentContents,
          isReplace: true,
        },
      ]);

      // Ensure that the expected cursor/selections are present
      await editableEditor.setSelections(
        snapshot.selections.map(plainObjectToSelection),
      );

      // Ensure that the expected hats are present
      await this.hatTokenMap.allocateHats(
        serializedMarksToTokenHats(snapshot.marks, this.editor),
      );

      ide().setHighlightRanges(
        HIGHLIGHT_COLOR,
        this.editor,
        Object.values(snapshot.marks ?? {}).map((range) =>
          toCharacterRange(plainObjectToRange(range)),
        ),
      );

      await editableEditor.focus();
    } catch (err) {
      if (retry) {
        this.editor = undefined;
        await this.setupStep(false);
      } else {
        throw err;
      }
    }
  }

  private async checkPreconditions() {
    if (this.state_.type === "doingTutorial") {
      const currentStep = this.currentTutorial!.steps[this.state_.stepNumber];

      const preConditionsMet = await this.arePreconditionsMet(currentStep);
      if (preConditionsMet !== this.state_.preConditionsMet) {
        this.setState({
          ...this.state_,
          preConditionsMet,
        });
      }
    }
  }

  private async arePreconditionsMet({
    initialState: snapshot,
    languageId,
  }: TutorialStep): Promise<boolean> {
    if (snapshot == null) {
      return true;
    }

    if (ide().activeTextEditor !== this.editor) {
      return false;
    }

    if (this.editor == null || this.editor.document.languageId !== languageId) {
      return false;
    }

    if (this.editor.document.getText() !== snapshot.documentContents) {
      return false;
    }

    if (
      !isEqual(
        this.editor.selections,
        snapshot.selections.map(plainObjectToSelection),
      )
    ) {
      return false;
    }

    const readableHatMap = await this.hatTokenMap.getReadableMap(false);
    for (const mark of serializedMarksToTokenHats(
      snapshot.marks,
      this.editor,
    )) {
      if (
        !readableHatMap
          .getToken(mark.hatStyle, mark.grapheme)
          ?.range.isRangeEqual(mark.hatRange)
      ) {
        return false;
      }
    }

    return true;
  }
}
