import {
  ActionType,
  CommandLatest,
  CommandResponse,
  EnforceUndefined,
  extractTargetedMarks,
  ExtraSnapshotField,
  Fallback,
  FocusedElementType,
  marksToPlainObject,
  PartialTargetDescriptor,
  PlainSpyIDERecordedValues,
  ReadOnlyHatMap,
  SerializedMarks,
  serializeTestFixture,
  SpyIDE,
  spyIDERecordedValuesToPlainObject,
  TestCaseFixture,
  TestCaseSnapshot,
  ThrownError,
  Token,
} from "@cursorless/common";
import { pick } from "lodash";
import { StoredTargetMap } from "..";
import { ide } from "../singletons/ide.singleton";
import { extractTargetKeys } from "../testUtil/extractTargetKeys";
import { takeSnapshot } from "../testUtil/takeSnapshot";
import { getPartialTargetDescriptors } from "../util/getPartialTargetDescriptors";
import { unsafeKeys } from "../util/object";

export class TestCase {
  private languageId: string;
  private partialTargetDescriptors: PartialTargetDescriptor[];
  private initialState: TestCaseSnapshot | null = null;
  private finalState?: TestCaseSnapshot;
  thrownError?: ThrownError;
  private returnValue?: unknown;
  private fallback?: Fallback;
  private targetKeys: string[];
  private _awaitingFinalMarkInfo: boolean;
  private marksToCheck?: string[];
  command: CommandLatest;
  private spyIdeValues?: PlainSpyIDERecordedValues;

  constructor(
    command: CommandLatest,
    private focusedElementType: FocusedElementType | undefined,
    private hatTokenMap: ReadOnlyHatMap,
    private storedTargets: StoredTargetMap,
    private spyIde: SpyIDE,
    private isHatTokenMapTest: boolean = false,
    private isDecorationsTest: boolean = false,
    private startTimestamp: bigint,
    private captureFinalThatMark: boolean,
    private extraSnapshotFields?: ExtraSnapshotField[],
    public readonly spokenFormError?: string,
  ) {
    const activeEditor = ide().activeTextEditor!;
    this.command = command;
    this.partialTargetDescriptors = getPartialTargetDescriptors(command.action);
    this.targetKeys = this.partialTargetDescriptors
      .map(extractTargetKeys)
      .flat();
    this.languageId = activeEditor.document.languageId;
    this._awaitingFinalMarkInfo = isHatTokenMapTest;
  }

  private getMarks() {
    let marks: Record<string, Token>;

    if (this.isHatTokenMapTest) {
      // If we're doing a navigation map test, then we grab the entire
      // navigation map because we'll filter it later based on the marks
      // referenced in the expected follow up command
      marks = Object.fromEntries(this.hatTokenMap.getEntries());
    } else {
      marks = extractTargetedMarks(this.targetKeys, this.hatTokenMap);
    }

    return marksToPlainObject(marks);
  }

  private includesThatMark(
    target: PartialTargetDescriptor,
    type: string,
  ): boolean {
    if (target.type === "primitive" && target.mark?.type === type) {
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

    const excludedFields = {
      clipboard: !clipboardActions.includes(this.command.action.name),
      thatMark:
        (!isInitialSnapshot && !this.captureFinalThatMark) ||
        (isInitialSnapshot &&
          !this.partialTargetDescriptors.some((target) =>
            this.includesThatMark(target, "that"),
          )),
      sourceMark:
        (!isInitialSnapshot && !this.captureFinalThatMark) ||
        (isInitialSnapshot &&
          !this.partialTargetDescriptors.some((target) =>
            this.includesThatMark(target, "source"),
          )),
      visibleRanges: !visibleRangeActions.includes(this.command.action.name),
    };

    return unsafeKeys(excludedFields).filter((field) => excludedFields[field]);
  }

  toYaml() {
    if (
      this.initialState == null ||
      (this.finalState == null && this.thrownError == null)
    ) {
      throw Error("Two snapshots must be taken before serializing");
    }
    const fixture: EnforceUndefined<TestCaseFixture> = {
      languageId: this.languageId,
      focusedElementType:
        this.focusedElementType !== "textEditor"
          ? this.focusedElementType ?? "other"
          : undefined,
      postEditorOpenSleepTimeMs: undefined,
      postCommandSleepTimeMs: undefined,
      command: this.command,
      spokenFormError: this.spokenFormError,
      marksToCheck: this.marksToCheck,
      initialState: this.initialState,
      finalState: this.finalState,
      returnValue: this.returnValue,
      fallback: this.fallback,
      thrownError: this.thrownError,
      ide: this.spyIdeValues,
    };
    return serializeTestFixture(fixture);
  }

  async recordInitialState() {
    const excludeFields = this.getExcludedFields(true);
    this.initialState = await takeSnapshot(
      this.storedTargets,
      excludeFields,
      this.extraSnapshotFields,
      ide().activeTextEditor!,
      ide(),
      this.getMarks(),
      { startTimestamp: this.startTimestamp },
    );
  }

  async recordFinalState(returnValue: CommandResponse) {
    const excludeFields = this.getExcludedFields(false);

    if ("returnValue" in returnValue) {
      this.returnValue = returnValue.returnValue;
    }
    if ("fallback" in returnValue) {
      this.fallback = returnValue.fallback;
    }

    this.finalState = await takeSnapshot(
      this.storedTargets,
      excludeFields,
      this.extraSnapshotFields,
      ide().activeTextEditor!,
      ide(),
      this.isHatTokenMapTest ? this.getMarks() : undefined,
      { startTimestamp: this.startTimestamp },
    );
    this.recordSpyIdeValues();
  }

  private recordSpyIdeValues() {
    const raw = this.spyIde.getSpyValues(this.isDecorationsTest);
    this.spyIdeValues =
      raw == null ? undefined : spyIDERecordedValuesToPlainObject(raw);
  }

  filterMarks() {
    const marksToCheck = this.partialTargetDescriptors
      .map(extractTargetKeys)
      .flat();
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
