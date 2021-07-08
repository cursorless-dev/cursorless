import * as yaml from "js-yaml";
import * as vscode from "vscode";
import { Position, Range, Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import { ActionType, PartialTarget, PrimitiveTarget, Target } from "./Types";

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
  return { active: selection.active, anchor: selection.anchor };
}

export function serializePosition(position: Position): SerializedPosition {
  return { line: position.line, character: position.character };
}

type Command = {
  actionName: ActionType;
  partialTargets: PartialTarget[];
  extraArgs: any[];
};

type Snapshot = {
  document: string;
  visibleRanges: SerializedRange[];
  selections: SerializedSelection[];
};

type DecorationRanges = { [coloredSymbol: string]: SerializedRange };

export default class TestCase {
  command: Command;
  languageId: string;
  decorations: DecorationRanges | null;
  initialState: Snapshot | null = null;
  finalState: Snapshot | null = null;

  constructor(
    command: Command,
    targets: Target[],
    navigationMap: NavigationMap
  ) {
    const activeEditor = vscode.window.activeTextEditor!;

    this.command = command;
    this.languageId = activeEditor.document.languageId;
    this.decorations = this.extractTargetedDecorations(targets, navigationMap);
  }

  extractPrimitiveTargetKeys(...targets: PrimitiveTarget[]) {
    const keys: string[] = [];
    targets.forEach((target) => {
      if (target.mark.type === "decoratedSymbol") {
        keys.push(`${target.mark.symbolColor}.${target.mark.character}`);
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
      return null;
    }

    const decorationRanges = navigationMap.serializeRanges();
    const targetedDecorations: DecorationRanges = {};
    const targetKeys = targets.map(this.extractTargetKeys, this).flat();
    targetKeys.forEach((key) => {
      targetedDecorations[key] = decorationRanges[key];
    });
    return targetedDecorations;
  }

  takeSnapshot() {
    const activeEditor = vscode.window.activeTextEditor!;
    const snapshot: Snapshot = {
      document: activeEditor.document.getText(),
      selections: activeEditor.selections.map(serializeSelection),
      visibleRanges: activeEditor.visibleRanges.map(serializeRange),
    };

    if (this.initialState == null) {
      this.initialState = snapshot;
    } else if (this.finalState == null) {
      this.finalState = snapshot;
    } else {
      throw Error("Both test snapshots already taken");
    }
  }

  toYaml() {
    const fixture = {
      command: this.command,
      languageId: this.languageId,
      decorations: this.decorations,
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
