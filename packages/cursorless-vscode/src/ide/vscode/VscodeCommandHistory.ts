import {
  CommandComplete,
  CommandHistory,
  CommandHistoryItem,
  Disposable,
  FileSystem,
} from "@cursorless/common";
import * as fs from "fs/promises";
import { mkdirSync } from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { VscodeIDE } from "./VscodeIDE";

const dirName = "commandHistory";
const filePrefix = "cursorlessCommandHistory";
const settingSection = "cursorless";
const settingName = "commandHistory";
const settingFullName = `${settingSection}.${settingName}`;

export class VscodeCommandHistory implements CommandHistory {
  private readonly dirPath: string;
  private readonly cursorlessVersion: string;
  private disposable: Disposable;
  private active: boolean = false;

  constructor(ide: VscodeIDE, fileSystem: FileSystem) {
    this.evaluateSetting = this.evaluateSetting.bind(this);
    this.cursorlessVersion = ide.cursorlessVersion;
    this.dirPath = path.join(fileSystem.cursorlessDir, dirName);

    mkdirSync(this.dirPath, { recursive: true });

    this.evaluateSetting();

    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(settingFullName)) {
        this.evaluateSetting();
      }
    });
  }

  async append(command: CommandComplete): Promise<void> {
    if (!this.active) {
      return;
    }

    const date = new Date();
    const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;
    const file = path.join(this.dirPath, fileName);

    const historyItem: CommandHistoryItem = {
      date: getDayDate(date),
      cursorlessVersion: this.cursorlessVersion,
      command: sanitizeCommand(command),
    };
    const data = JSON.stringify(historyItem) + "\n";

    await fs.appendFile(file, data, "utf8");
  }

  private evaluateSetting() {
    this.active =
      vscode.workspace
        .getConfiguration(settingSection)
        .get<boolean>(settingName) ?? false;
    console.log(this.active);
  }

  dispose() {
    this.disposable.dispose();
  }
}

export const DisabledCommandHistory: CommandHistory = {
  async append(command: CommandComplete) {},
  dispose() {},
};

function sanitizeCommand(command: CommandComplete): CommandComplete {
  // TODO: Sanitize action payload
  const { spokenForm, ...rest } = command;
  return rest;
}

function getMonthDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function getDayDate(date: Date): string {
  return `${getMonthDate(date)}-${pad(date.getDate())}`;
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}
