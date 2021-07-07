import * as vscode from "vscode";
import { Position, Range, Selection } from "vscode";
import NavigationMap from "./NavigationMap";
import * as yaml from "js-yaml";
import {
  ActionType,
  PartialTarget,
  SimplePosition,
  SimpleRange,
} from "./Types";
import { writeFileSync } from "fs";

export function serializeRange(range: Range): SimpleRange {
  const { start, end } = range;
  return { start: serializePosition(start), end: serializePosition(end) };
}

export function serializeSelection(selection: Selection) {
  const { active, anchor } = selection;
  return { active, anchor };
}

export function serializePosition(position: Position): SimplePosition {
  const { line, character } = position;
  return { line, character };
}

type Command = {
  actionName: ActionType;
  partialTargets: PartialTarget[];
  extraArgs: any[];
};

type Snapshot = {
  fileContent: string;
  visibleRanges: SimpleRange[];
  selections: {
    active: { line: number; character: number };
    anchor: { line: number; character: number };
  }[];
};

export default class TestCase {
  command: Command;
  languageId: string;
  navigationMap: { [coloredSymbol: string]: SimpleRange } | null;
  initial: Snapshot | null = null;
  result: Snapshot | null = null;

  constructor(command: Command, navigationMap: NavigationMap | null) {
    const activeEditor = vscode.window.activeTextEditor!;

    this.command = command;
    this.languageId = activeEditor.document.languageId;
    this.navigationMap = navigationMap!.serializeRanges();
  }

  takeSnapshot() {
    const activeEditor = vscode.window.activeTextEditor!;

    const snapshot: Snapshot = {
      fileContent: activeEditor.document.getText(),
      selections: activeEditor.selections.map(serializeSelection),
      visibleRanges: activeEditor.visibleRanges.map(serializeRange),
    };

    if (this.initial == null) {
      this.initial = snapshot;
    } else if (this.result == null) {
      this.result = snapshot;
    } else {
      throw Error("Initial and Result test snapshots already taken");
    }
  }

  writeToFile() {
    const fixture = yaml.dump({
      command: this.command,
      languageId: this.languageId,
      navigationMap: this.navigationMap,
      initial: this.initial,
      result: this.result,
    });
    writeFileSync("/home/brock/code/cursorless-vscode/test.yaml", fixture);
  }
}
