import {
  ActionDescriptor,
  CommandComplete,
  Disposable,
  FileSystem,
  ReadOnlyHatMap,
} from "@cursorless/common";
import * as fs from "fs/promises";
import * as path from "path";
import * as vscode from "vscode";
import type {
  CommandRunner,
  CommandRunnerDecorator,
} from "@cursorless/cursorless-engine";

const dirName = "commandHistory";
const filePrefix = "cursorlessCommandHistory";
const settingSection = "cursorless";
const settingName = "commandHistory";
const settingFullName = `${settingSection}.${settingName}`;

export class VscodeCommandHistory implements CommandRunnerDecorator {
  private readonly dirPath: string;
  private readonly cursorlessVersion: string;
  private disposable: Disposable;
  private active: boolean = false;

  constructor(
    extensionContext: vscode.ExtensionContext,
    fileSystem: FileSystem,
  ) {
    this.evaluateSetting = this.evaluateSetting.bind(this);
    this.cursorlessVersion = extensionContext.extension.packageJSON.version;
    this.dirPath = path.join(fileSystem.cursorlessDir, dirName);

    this.evaluateSetting();

    this.disposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(settingFullName)) {
        this.evaluateSetting();
      }
    });
  }

  wrapCommandRunner(
    readableHatMap: ReadOnlyHatMap,
    runner: CommandRunner,
  ): CommandRunner {
    if (!this.active) {
      return runner;
    }
    return {
      run: async (commandComplete: CommandComplete) => {
        void this.append(commandComplete);

        return await runner.run(commandComplete);
      },
    };
  }

  private async append(command: CommandComplete): Promise<void> {
    await fs.mkdir(this.dirPath, { recursive: true });

    const date = new Date();
    const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;
    const file = path.join(this.dirPath, fileName);

    const historyItem = {
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
  }

  dispose() {
    this.disposable.dispose();
  }
}

function sanitizeCommand(command: CommandComplete): CommandComplete {
  const { spokenForm, action, ...rest } = command;
  return {
    ...rest,
    action: sanitizeAction(action),
  };
}

function sanitizeAction(action: ActionDescriptor): ActionDescriptor {
  switch (action.name) {
    // Remove replace with text
    case "replace":
      if (Array.isArray(action.replaceWith)) {
        return {
          ...action,
          replaceWith: [],
        };
      }
      break;

    // Remove substitutions and custom body
    case "insertSnippet": {
      const { substitutions, ...rest } = action.snippetDescription;
      return {
        ...action,
        snippetDescription:
          rest.type === "custom" ? { ...rest, body: "" } : rest,
      };
    }

    // Remove custom body
    case "wrapWithSnippet":
      if (action.snippetDescription.type === "custom") {
        return {
          ...action,
          snippetDescription: {
            ...action.snippetDescription,
            body: "",
          },
        };
      }
      break;
  }

  return action;
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
