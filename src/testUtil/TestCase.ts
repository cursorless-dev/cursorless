import * as vscode from "vscode";
import NavigationMap from "../core/NavigationMap";
import { ThatMark } from "../core/ThatMark";
import { ActionType, PartialTarget, Target, Token } from "../typings/Types";
import {
  extractTargetedMarks,
  extractTargetKeys,
} from "./extractTargetedMarks";
import { marksToPlainObject, SerializedMarks } from "./toPlainObject";
import { takeSnapshot, TestCaseSnapshot } from "./takeSnapshot";
import serialize from "./serialize";
import { pick } from "lodash";

export type TestCaseCommand = {
  actionName: ActionType;
  partialTargets: PartialTarget[];
  extraArgs: any[];
};

export type TestCaseContext = {
  spokenForm: string;
  thatMark: ThatMark;
  sourceMark: ThatMark;
  targets: Target[];
  navigationMap: NavigationMap;
};

export type TestCaseFixture = {
  spokenForm: string;
  command: TestCaseCommand;
  languageId: string;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
  returnValue: unknown;
  /** Inferred full targets added for context; not currently used in testing */
  fullTargets: Target[];

  /**
   * A list of marks to check in the case of navigation map test otherwise undefined
   */
  marksToCheck?: string[];
};

export class TestCase {
  spokenForm: string;
  languageId: string;
  fullTargets: Target[];
  initialState: TestCaseSnapshot | null = null;
  finalState: TestCaseSnapshot | null = null;
  returnValue: unknown = null;
  targetKeys: string[];
  private _awaitingFinalMarkInfo: boolean;
  marksToCheck?: string[];

  constructor(
    private command: TestCaseCommand,
    private context: TestCaseContext,
    private isNavigationMapTest: boolean = false
  ) {
    const activeEditor = vscode.window.activeTextEditor!;

    const { targets, spokenForm } = context;

    this.targetKeys = targets.map(extractTargetKeys).flat();

    this.spokenForm = spokenForm;
    this.languageId = activeEditor.document.languageId;
    this.fullTargets = targets;
    this._awaitingFinalMarkInfo = isNavigationMapTest;
  }

  private getMarks() {
    let marks: Record<string, Token>;

    const { navigationMap } = this.context;

    if (this.isNavigationMapTest) {
      // If we're doing a navigation map test, then we grab the entire
      // navigation map because we'll filter it later based on the marks
      // referenced in the expected follow up command
      marks = Object.fromEntries(navigationMap.getEntries());
    } else {
      marks = extractTargetedMarks(this.targetKeys, navigationMap);
    }

    return marksToPlainObject(marks);
  }

  private includesThatMark(target: Target, type: string): boolean {
    if (target.type === "primitive" && target.mark.type === type) {
      return true;
    } else if (target.type === "list") {
      return target.elements.some((target) =>
        this.includesThatMark(target, type)
      );
    } else if (target.type === "range") {
      return [target.anchor, target.active].some((target) =>
        this.includesThatMark(target, type)
      );
    }
    return false;
  }

  private getExcludedFields(context?: { initialSnapshot?: boolean }) {
    const excludableFields = {
      clipboard: !["copy", "paste"].includes(this.command.actionName),
      thatMark:
        context?.initialSnapshot &&
        !this.fullTargets.some((target) =>
          this.includesThatMark(target, "that")
        ),
      sourceMark:
        context?.initialSnapshot &&
        !this.fullTargets.some((target) =>
          this.includesThatMark(target, "source")
        ),
      visibleRanges: ![
        "fold",
        "unfold",
        "scrollToBottom",
        "scrollToCenter",
        "scrollToTop",
      ].includes(this.command.actionName),
    };

    return Object.keys(excludableFields).filter(
      (field) => excludableFields[field]
    );
  }

  toYaml() {
    if (this.initialState == null || this.finalState == null) {
      throw Error("Two snapshots must be taken before serializing");
    }
    const fixture: TestCaseFixture = {
      spokenForm: this.spokenForm,
      languageId: this.languageId,
      command: this.command,
      initialState: this.initialState,
      finalState: this.finalState,
      returnValue: this.returnValue,
      fullTargets: this.fullTargets,
      marksToCheck: this.marksToCheck,
    };
    return serialize(fixture);
  }

  async recordInitialState() {
    const excludeFields = this.getExcludedFields({ initialSnapshot: true });
    this.initialState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.getMarks()
    );
  }

  async recordFinalState(returnValue: unknown) {
    const excludeFields = this.getExcludedFields();
    this.returnValue = returnValue;
    this.finalState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.isNavigationMapTest ? this.getMarks() : undefined
    );
  }

  filterMarks(command: TestCaseCommand, context: TestCaseContext) {
    const marksToCheck = context.targets.map(extractTargetKeys).flat();
    const keys = this.targetKeys.concat(marksToCheck);

    this.initialState!.marks = pick(
      this.initialState!.marks,
      keys
    ) as SerializedMarks;

    this.finalState!.marks = pick(
      this.finalState!.marks,
      keys
    ) as SerializedMarks;

    this.marksToCheck = marksToCheck;

    this._awaitingFinalMarkInfo = false;
  }

  get awaitingFinalMarkInfo() {
    return this._awaitingFinalMarkInfo;
  }
}
