import {
  ActionDescriptor,
  CommandComplete,
  CommandHistoryItem,
  Disposable,
  FileSystem,
  ReadOnlyHatMap,
} from "@cursorless/common";
import type {
  CommandRunner,
  CommandRunnerDecorator,
} from "@cursorless/cursorless-engine";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

const filePrefix = "cursorlessCommandHistory";
const settingSection = "cursorless";
const settingName = "commandHistory";
const settingFullName = `${settingSection}.${settingName}`;

export class CommandHistory implements CommandRunnerDecorator {
  private readonly dirPath: string;
  private readonly cursorlessVersion: string;
  private disposable: Disposable;
  private isActive: boolean = false;

  constructor(
    extensionContext: vscode.ExtensionContext,
    fileSystem: FileSystem,
  ) {
    this.cursorlessVersion = extensionContext.extension.packageJSON.version;
    this.dirPath = fileSystem.cursorlessCommandHistoryDirPath;

    // Read initial setting value. The watcher below will take care of changes.
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
    if (!this.isActive) {
      return runner;
    }

    return {
      run: async (commandComplete: CommandComplete) => {
        await this.append(commandComplete);

        return await runner.run(commandComplete);
      },
    };
  }

  private async append(command: CommandComplete): Promise<void> {
    const date = new Date();
    const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;
    const file = path.join(this.dirPath, fileName);

    const historyItem: CommandHistoryItem = {
      date: getDayDate(date),
      cursorlessVersion: this.cursorlessVersion,
      command: sanitizeCommand(command),
    };
    const data = JSON.stringify(historyItem) + "\n";

    await fs.mkdir(this.dirPath, { recursive: true });
    await fs.appendFile(file, data, "utf8");
  }

  private evaluateSetting() {
    this.isActive = vscode.workspace
      .getConfiguration(settingSection)
      .get<boolean>(settingName, false);
  }

  dispose() {
    this.disposable.dispose();
  }
}

// Remove spoken form and sanitize action
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
