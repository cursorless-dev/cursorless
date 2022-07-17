import { pick } from "lodash";
import * as vscode from "vscode";
import type { ActionType } from "../actions/actions.types";
import type { CommandLatest } from "../core/commandRunner/command.types";
import type { TestDecoration } from "../core/editStyles";
import type { ReadOnlyHatMap } from "../core/IndividualHatMap";
import type { ThatMark } from "../core/ThatMark";
import type { TargetDescriptor } from "../typings/targetDescriptor.types";
import type { Token } from "../typings/Types";
import { cleanUpTestCaseCommand } from "./cleanUpTestCaseCommand";
import {
  extractTargetedMarks,
  extractTargetKeys,
} from "./extractTargetedMarks";
import serialize from "./serialize";
import type { ExtraSnapshotField, TestCaseSnapshot } from "./takeSnapshot";
import { takeSnapshot } from "./takeSnapshot";
import type { PositionPlainObject, SerializedMarks } from "./toPlainObject";
import {
  marksToPlainObject,
  testDecorationsToPlainObject,
} from "./toPlainObject";

export type TestCaseCommand = CommandLatest;

export type TestCaseContext = {
  thatMark: ThatMark;
  sourceMark: ThatMark;
  targets: TargetDescriptor[];
  decorations: TestDecoration[];
  hatTokenMap: ReadOnlyHatMap;
};

interface PlainTestDecoration {
  name: string;
  type: "token" | "line";
  start: PositionPlainObject;
  end: PositionPlainObject;
}

export type ThrownError = {
  name: string;
};

export type TestCaseFixture = {
  languageId: string;
  postEditorOpenSleepTimeMs?: number;
  postCommandSleepTimeMs?: number;
  command: TestCaseCommand;

  /**
   * A list of marks to check in the case of navigation map test otherwise undefined
   */
  marksToCheck?: string[];

  initialState: TestCaseSnapshot;
  decorations?: PlainTestDecoration[];
  /** The final state after a command is issued. Undefined if we are testing a non-match(error) case. */
  finalState?: TestCaseSnapshot;
  /** Used to assert if an error has been thrown. */
  thrownError?: ThrownError;
  returnValue: unknown;
  /** Inferred full targets added for context; not currently used in testing */
  fullTargets: TargetDescriptor[];
};

export class TestCase {
  languageId: string;
  fullTargets: TargetDescriptor[];
  initialState: TestCaseSnapshot | null = null;
  decorations?: PlainTestDecoration[];
  finalState?: TestCaseSnapshot;
  thrownError?: ThrownError;
  returnValue: unknown = null;
  targetKeys: string[];
  private _awaitingFinalMarkInfo: boolean;
  marksToCheck?: string[];
  public command: TestCaseCommand;

  constructor(
    command: TestCaseCommand,
    private context: TestCaseContext,
    private isHatTokenMapTest: boolean = false,
    private isDecorationsTest: boolean = false,
    private startTimestamp: bigint,
    private extraSnapshotFields?: ExtraSnapshotField[]
  ) {
    const activeEditor = vscode.window.activeTextEditor!;
    this.command = cleanUpTestCaseCommand(command);

    const { targets } = context;

    this.targetKeys = targets.map(extractTargetKeys).flat();

    this.languageId = activeEditor.document.languageId;
    this.fullTargets = targets;
    this._awaitingFinalMarkInfo = isHatTokenMapTest;
  }

  recordDecorations() {
    const decorations = this.context.decorations;
    if (this.isDecorationsTest && decorations.length > 0) {
      this.decorations = testDecorationsToPlainObject(decorations);
    }
  }

  private getMarks() {
    let marks: Record<string, Token>;

    const { hatTokenMap } = this.context;

    if (this.isHatTokenMapTest) {
      // If we're doing a navigation map test, then we grab the entire
      // navigation map because we'll filter it later based on the marks
      // referenced in the expected follow up command
      marks = Object.fromEntries(hatTokenMap.getEntries());
    } else {
      marks = extractTargetedMarks(this.targetKeys, hatTokenMap);
    }

    return marksToPlainObject(marks);
  }

  private includesThatMark(target: TargetDescriptor, type: string): boolean {
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
    const clipboardActions: ActionType[] = context?.initialSnapshot
      ? ["pasteFromClipboard"]
      : ["copyToClipboard", "cutToClipboard"];

    const visibleRangeActions: ActionType[] = [
      "foldRegion",
      "unfoldRegion",
      "scrollToBottom",
      "scrollToCenter",
      "scrollToTop",
    ];

    const excludableFields = {
      clipboard: !clipboardActions.includes(this.command.action.name),
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
      visibleRanges: !visibleRangeActions.includes(this.command.action.name),
    };

    return Object.keys(excludableFields).filter(
      (field) => excludableFields[field]
    );
  }

  toYaml() {
    if (
      this.initialState == null ||
      (this.finalState == null && this.thrownError == null)
    ) {
      throw Error("Two snapshots must be taken before serializing");
    }
    const fixture: TestCaseFixture = {
      languageId: this.languageId,
      command: this.command,
      marksToCheck: this.marksToCheck,
      initialState: this.initialState,
      finalState: this.finalState,
      decorations: this.decorations,
      returnValue: this.returnValue,
      fullTargets: this.fullTargets,
      thrownError: this.thrownError,
    };
    return serialize(fixture);
  }

  async recordInitialState() {
    const excludeFields = this.getExcludedFields({ initialSnapshot: true });
    this.initialState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.extraSnapshotFields,
      this.getMarks(),
      { startTimestamp: this.startTimestamp }
    );
  }

  async recordFinalState(returnValue: unknown) {
    const excludeFields = this.getExcludedFields();
    this.returnValue = returnValue;
    this.finalState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.extraSnapshotFields,
      this.isHatTokenMapTest ? this.getMarks() : undefined,
      { startTimestamp: this.startTimestamp }
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
