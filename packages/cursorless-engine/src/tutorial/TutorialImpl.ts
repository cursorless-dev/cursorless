import {
  Disposable,
  HatTokenMap,
  Notifier,
  RawTutorialContent,
  ReadOnlyHatMap,
  ScopeType,
  TextEditor,
  TutorialContentProvider,
  TutorialId,
  TutorialState,
} from "@cursorless/common";
import { produce } from "immer";
import { isEqual } from "lodash-es";
import { CommandRunner } from "../CommandRunner";
import { CommandRunnerDecorator } from "../api/CursorlessEngineApi";
import { Tutorial } from "../api/Tutorial";
import { TutorialContent } from "./types/tutorial.types";
import { Debouncer } from "../core/Debouncer";
import { CustomSpokenFormGeneratorImpl } from "../generateSpokenForm/CustomSpokenFormGeneratorImpl";
import { ide } from "../singletons/ide.singleton";
import { arePreconditionsMet } from "./arePreconditionsMet";
import { setupStep } from "./setupStep";
import { loadTutorial } from "./loadTutorial";
import { tutorialWrapCommandRunner } from "./tutorialWrapCommandRunner";

export class TutorialImpl implements Tutorial, CommandRunnerDecorator {
  /**
   * The current editor that is being used to display the tutorial, if any.
   */
  private editor?: TextEditor;

  /**
   * The current state of the tutorial, as exposed by {@link Tutorial.state}.
   */
  private state_: TutorialState = { type: "loading" };

  /**
   * If {@link state_} is "doingTutorial", this will be the fully parsed current
   * tutorial, including information about triggers, etc.
   */
  private currentTutorial: TutorialContent | undefined;

  private notifier: Notifier<[TutorialState]> = new Notifier();

  private disposables: Disposable[] = [];

  /**
   * The raw tutorials that are available to the user. These are the tutorials
   * that are loaded from disk and have not been parsed yet.
   */
  private rawTutorials!: RawTutorialContent[];

  constructor(
    private hatTokenMap: HatTokenMap,
    private customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
    private contentProvider: TutorialContentProvider,
  ) {
    this.setupStep = this.setupStep.bind(this);
    this.reparseCurrentTutorial = this.reparseCurrentTutorial.bind(this);
    const debouncer = new Debouncer(() => this.checkPreconditions(), 100);

    this.loadTutorials().then(() => {
      if (this.state_.type === "loading") {
        this.setState(this.getPickingTutorialState());
      }
    });

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

  async loadTutorials() {
    this.rawTutorials = await this.contentProvider.loadRawTutorials();
  }

  /**
   * @returns A {@link TutorialState} object to use when the user is picking a
   * tutorial to start.
   */
  getPickingTutorialState(): TutorialState {
    const tutorialProgress = ide().globalState.get("tutorialProgress");

    return {
      type: "pickingTutorial",
      tutorials: this.rawTutorials.map((rawContent) => ({
        id: rawContent.id,
        title: rawContent.title,
        version: rawContent.version,
        stepCount: rawContent.steps.length,
        currentStep: tutorialProgress[rawContent.id]?.currentStep ?? 0,
      })),
    };
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
    return tutorialWrapCommandRunner(this, commandRunner, this.currentTutorial);
  }

  public onState(callback: (state: TutorialState) => void): Disposable {
    return this.notifier.registerListener(callback);
  }

  /**
   * Reparse the current tutorial. This is useful when the user has changed the
   * spoken forms and we need to reparse the tutorial to use their new spoken
   * forms.
   */
  private async reparseCurrentTutorial() {
    if (this.currentTutorial == null || this.state_.type !== "doingTutorial") {
      return;
    }

    const tutorialId = this.state_.id;

    const { tutorialContent, state } = await loadTutorial(
      this.contentProvider,
      tutorialId,
      this.customSpokenFormGenerator,
      this.getRawTutorial(tutorialId),
    );

    this.currentTutorial = tutorialContent;
    this.setState(
      state.hasErrors
        ? {
            ...state,
            stepNumber: this.state_.stepNumber,
          }
        : {
            ...state,
            stepNumber: this.state_.stepNumber,
            stepContent: tutorialContent.steps[this.state_.stepNumber].content,
          },
    );
  }

  private getRawTutorial(tutorialId: string) {
    return this.rawTutorials.find(
      (rawContent) => rawContent.id === tutorialId,
    )!;
  }

  async start(tutorialId: TutorialId | number): Promise<void> {
    if (typeof tutorialId === "number") {
      tutorialId = this.rawTutorials[tutorialId].id;
    }

    const { tutorialContent, state } = await loadTutorial(
      this.contentProvider,
      tutorialId,
      this.customSpokenFormGenerator,
      this.getRawTutorial(tutorialId),
    );

    this.currentTutorial = tutorialContent;
    this.setState(state);

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

  /**
   * When currently doing a tutorial, change to a different step.
   *
   * @param getStep Indicates which step to change to
   */
  private async changeStep(
    getStep: (current: number) => number,
  ): Promise<void> {
    if (this.state_.type !== "doingTutorial") {
      throw new Error("Not currently doing a tutorial");
    }

    if (this.state_.hasErrors) {
      throw new Error("Please see error message in tutorial sidebar");
    }

    const newStepNumber = getStep(this.state_.stepNumber);

    if (newStepNumber === this.state_.stepCount || newStepNumber < 0) {
      await this.list();
      return;
    }

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
    this.setState(this.getPickingTutorialState());
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

  private async setupStep() {
    this.editor = await setupStep(
      this.hatTokenMap,
      this.editor,
      this.state,
      this.currentTutorial,
    );
  }

  private async checkPreconditions() {
    if (this.state_.type === "doingTutorial") {
      const currentStep = this.currentTutorial!.steps[this.state_.stepNumber];

      const preConditionsMet = await arePreconditionsMet(
        this.editor,
        this.hatTokenMap,
        currentStep,
      );
      if (preConditionsMet !== this.state_.preConditionsMet) {
        this.setState({
          ...this.state_,
          preConditionsMet,
        });
      }
    }
  }
}
