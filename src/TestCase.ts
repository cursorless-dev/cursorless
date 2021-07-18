import * as yaml from "js-yaml";
import { isEqual } from "lodash";
import * as vscode from "vscode";
import { Position, Range, Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import { ThatMark } from "./ThatMark";
import {
  ActionType,
  PartialTarget,
  PrimitiveTarget,
  SelectionWithEditor,
  Target,
} from "./Types";

export type SerializedPosition = {
  line: number;
  character: number;
};

export type SerializedRange = {
  start: SerializedPosition;
  end: SerializedPosition;
};

export type SerializedSelection = {
  anchor: SerializedPosition;
  active: SerializedPosition;
};

export function serializeRange(range: Range): SerializedRange {
  return {
    start: serializePosition(range.start),
    end: serializePosition(range.end),
  };
}

export function serializeSelection(selection: Selection): SerializedSelection {
  return {
    active: serializePosition(selection.active),
    anchor: serializePosition(selection.anchor),
  };
}

export function serializePosition(position: Position): SerializedPosition {
  return { line: position.line, character: position.character };
}

type TestCaseCommand = {
  actionName: ActionType;
  partialTargets: PartialTarget[];
  extraArgs: any[];
};

type TestCaseContext = {
  thatMark: ThatMark;
  targets: Target[];
  navigationMap: NavigationMap;
};

type TestCaseSnapshot = {
  document: string;
  clipboard: string;
  visibleRanges: SerializedRange[];
  selections: SerializedSelection[];
  thatMark: SerializedSelection[] | null;
};

type DecorationRanges = { [coloredSymbol: string]: SerializedRange };

export type TestCaseFixture = {
  command: TestCaseCommand;
  targets: Target[];
  languageId: string;
  marks: DecorationRanges;
  initialState: TestCaseSnapshot;
  finalState: TestCaseSnapshot;
};

export default class TestCase {
  command: TestCaseCommand;
  languageId: string;
  targets: Target[];
  marks: DecorationRanges;
  context: TestCaseContext;
  initialState: TestCaseSnapshot | null = null;
  finalState: TestCaseSnapshot | null = null;

  constructor(command: TestCaseCommand, context: TestCaseContext) {
    const activeEditor = vscode.window.activeTextEditor!;
    const { navigationMap, targets } = context;

    this.command = command;
    this.languageId = activeEditor.document.languageId;
    this.marks = this.extractTargetedDecorations(targets, navigationMap);
    this.targets = targets;
    this.context = context;
  }

  extractPrimitiveTargetKeys(...targets: PrimitiveTarget[]) {
    const keys: string[] = [];
    targets.forEach((target) => {
      if (target.mark.type === "decoratedSymbol") {
        const { character, symbolColor } = target.mark;
        keys.push(NavigationMap.getKey(symbolColor, character));
      }
    });
    return keys;
  }

  extractTargetKeys(target: Target): string[] {
    switch (target.type) {
      case "primitive":
        return this.extractPrimitiveTargetKeys(target);

      case "list":
        return target.elements.map(this.extractTargetKeys, this).flat();

      case "range":
        return this.extractPrimitiveTargetKeys(target.start, target.end);

      default:
        return [];
    }
  }

  extractTargetedDecorations(targets: Target[], navigationMap: NavigationMap) {
    if (!navigationMap) {
      return {};
    }

    const decorationRanges = navigationMap.serializeRanges();
    const targetedDecorations: DecorationRanges = {};
    const targetKeys = targets.map(this.extractTargetKeys, this).flat();
    targetKeys.forEach((key) => {
      targetedDecorations[key] = decorationRanges[key];
    });
    return targetedDecorations;
  }

  isThatMarkTargeted() {
    return this.context.thatMark.get().every(({ selection: thatSelection }) => {
      return Object.values(this.marks).some((targetedSelection) => {
        return (
          thatSelection.end.character === targetedSelection.end.character &&
          thatSelection.end.line === targetedSelection.end.line &&
          thatSelection.start.character === targetedSelection.start.character &&
          thatSelection.start.line === targetedSelection.start.line
        );
      });
    });
  }

  static async getSnapshot(
    thatMark: SelectionWithEditor[]
  ): Promise<TestCaseSnapshot> {
    const activeEditor = vscode.window.activeTextEditor!;
    return {
      document: activeEditor.document.getText(),
      selections: activeEditor.selections.map(serializeSelection),
      visibleRanges: activeEditor.visibleRanges.map(serializeRange),
      clipboard: await vscode.env.clipboard.readText(),
      thatMark: thatMark.map((mark) => serializeSelection(mark.selection)),
    };
  }

  async getSnapshot(): Promise<TestCaseSnapshot> {
    return await TestCase.getSnapshot(this.context.thatMark.get());
  }

  async saveSnapshot() {
    const snapshot = await this.getSnapshot();

    if (!["copy", "paste"].includes(this.command.actionName)) {
      snapshot.clipboard = "";
    }

    // if (this.initialState == null && !this.isThatMarkTargeted()) {
    //   snapshot.thatMark = [];
    // }

    if (this.initialState == null) {
      this.initialState = snapshot;
    } else if (this.finalState == null) {
      this.finalState = snapshot;
    } else {
      throw Error("Both snapshots already taken");
    }

    return snapshot;
  }

  toYaml() {
    if (this.initialState == null || this.finalState == null) {
      throw Error("Two snapshots must be taken before serializing");
    }
    const fixture: TestCaseFixture = {
      command: this.command,
      languageId: this.languageId,
      targets: this.targets,
      marks: this.marks,
      initialState: this.initialState,
      finalState: this.finalState,
    };
    return yaml.dump(fixture, { noRefs: true });
  }

  async presentFixture() {
    const fixture = this.toYaml();
    const document = await vscode.workspace.openTextDocument({
      language: "yaml",
      content: fixture,
    });
    await vscode.window.showTextDocument(document, {
      preserveFocus: true,
      preview: true,
      viewColumn: vscode.ViewColumn.Beside,
    });
  }
}
