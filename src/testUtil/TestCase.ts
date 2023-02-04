import { pick } from "lodash";
import { ActionType } from "../core/commandRunner/typings/ActionCommand";
import { TestDecoration } from "../core/editStyles";
import { ReadOnlyHatMap } from "../core/IndividualHatMap";
import { ThatMark } from "../core/ThatMark";
import SpyIDE, { SpyIDERecordedValues } from "../libs/common/ide/spy/SpyIDE";
import {
  extractTargetedMarks,
  extractTargetKeys,
} from "../libs/common/testUtil/extractTargetedMarks";
import serialize from "../libs/common/testUtil/serialize";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import {
  ExtraSnapshotField,
  takeSnapshot,
  TestCaseSnapshot,
} from "../libs/vscode-common/testUtil/takeSnapshot";
import {
  marksToPlainObject,
  SerializedMarks,
  testDecorationsToPlainObject,
} from "../libs/common/testUtil/toPlainObject";
import { TargetDescriptor } from "../typings/TargetDescriptor";
import { Token } from "../typings/Types";
import { cleanUpTestCaseCommand } from "./cleanUpTestCaseCommand";
import type {
  PlainTestDecoration,
  TestCaseCommand,
  TestCaseFixture,
  ThrownError,
} from "./TestCaseFixture";

export type TestCaseContext = {
  thatMark: ThatMark;
  sourceMark: ThatMark;
  targets: TargetDescriptor[];
  decorations: TestDecoration[];
  hatTokenMap: ReadOnlyHatMap;
};

export class TestCase {
  private languageId: string;
  private fullTargets: TargetDescriptor[];
  private initialState: TestCaseSnapshot | null = null;
  private decorations?: PlainTestDecoration[];
  private finalState?: TestCaseSnapshot;
  thrownError?: ThrownError;
  private returnValue?: unknown;
  private targetKeys: string[];
  private _awaitingFinalMarkInfo: boolean;
  private marksToCheck?: string[];
  command: TestCaseCommand;
  private spyIdeValues?: SpyIDERecordedValues;

  constructor(
    command: TestCaseCommand,
    private context: TestCaseContext,
    private spyIde: SpyIDE,
    private isHatTokenMapTest: boolean = false,
    private isDecorationsTest: boolean = false,
    private startTimestamp: bigint,
    private captureFinalThatMark: boolean,
    private extraSnapshotFields?: ExtraSnapshotField[],
  ) {
    const activeEditor = ide().activeTextEditor!;
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
        this.includesThatMark(target, type),
      );
    } else if (target.type === "range") {
      return [target.anchor, target.active].some((target) =>
        this.includesThatMark(target, type),
      );
    }
    return false;
  }

  private getExcludedFields(isInitialSnapshot: boolean) {
    const clipboardActions: ActionType[] = isInitialSnapshot
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
        (!isInitialSnapshot && !this.captureFinalThatMark) ||
        (isInitialSnapshot &&
          !this.fullTargets.some((target) =>
            this.includesThatMark(target, "that"),
          )),
      sourceMark:
        (!isInitialSnapshot && !this.captureFinalThatMark) ||
        (isInitialSnapshot &&
          !this.fullTargets.some((target) =>
            this.includesThatMark(target, "source"),
          )),
      visibleRanges: !visibleRangeActions.includes(this.command.action.name),
    };

    return Object.keys(excludableFields).filter(
      (field) => excludableFields[field],
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
      thrownError: this.thrownError,
      ide: this.spyIdeValues,
      fullTargets: this.fullTargets,
    };
    return serialize(fixture);
  }

  async recordInitialState() {
    const excludeFields = this.getExcludedFields(true);
    this.initialState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.extraSnapshotFields,
      ide().activeTextEditor!,
      ide(),
      this.getMarks(),
      { startTimestamp: this.startTimestamp },
    );
  }

  async recordFinalState(returnValue: unknown) {
    const excludeFields = this.getExcludedFields(false);
    this.returnValue = returnValue;
    this.finalState = await takeSnapshot(
      this.context.thatMark,
      this.context.sourceMark,
      excludeFields,
      this.extraSnapshotFields,
      ide().activeTextEditor!,
      ide(),
      this.isHatTokenMapTest ? this.getMarks() : undefined,
      { startTimestamp: this.startTimestamp },
    );
    this.recordDecorations();
    this.recordSpyIdeValues();
  }

  private recordSpyIdeValues() {
    this.spyIdeValues = this.spyIde.getSpyValues();
  }

  filterMarks(command: TestCaseCommand, context: TestCaseContext) {
    const marksToCheck = context.targets.map(extractTargetKeys).flat();
    const keys = this.targetKeys.concat(marksToCheck);

    this.initialState!.marks = pick(
      this.initialState!.marks,
      keys,
    ) as SerializedMarks;

    this.finalState!.marks = pick(
      this.finalState!.marks,
      keys,
    ) as SerializedMarks;

    this.marksToCheck = marksToCheck;

    this._awaitingFinalMarkInfo = false;
  }

  get awaitingFinalMarkInfo() {
    return this._awaitingFinalMarkInfo;
  }
}
