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

/**
 * When user opts in, this class sanitizes and appends each Cursorless command to a local log file in `.cursorless` dir.
 */
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
        await this.appendToLog(commandComplete);

        return await runner.run(commandComplete);
      },
    };
  }

  private async appendToLog(command: CommandComplete): Promise<void> {
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
      return action;

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
      return action;

    case "breakLine":
    case "clearAndSetSelection":
    case "copyToClipboard":
    case "cutToClipboard":
    case "deselect":
    case "editNewLineAfter":
    case "editNewLineBefore":
    case "experimental.setInstanceReference":
    case "extractVariable":
    case "findInWorkspace":
    case "foldRegion":
    case "followLink":
    case "indentLine":
    case "insertCopyAfter":
    case "insertCopyBefore":
    case "insertEmptyLineAfter":
    case "insertEmptyLineBefore":
    case "insertEmptyLinesAround":
    case "joinLines":
    case "outdentLine":
    case "randomizeTargets":
    case "remove":
    case "rename":
    case "revealDefinition":
    case "revealTypeDefinition":
    case "reverseTargets":
    case "scrollToBottom":
    case "scrollToCenter":
    case "scrollToTop":
    case "setSelection":
    case "setSelectionAfter":
    case "setSelectionBefore":
    case "showDebugHover":
    case "showHover":
    case "showQuickFix":
    case "showReferences":
    case "sortTargets":
    case "toggleLineBreakpoint":
    case "toggleLineComment":
    case "unfoldRegion":
    case "private.showParseTree":
    case "private.getTargets":
    case "callAsFunction":
    case "editNew":
    case "executeCommand":
    case "generateSnippet":
    case "getText":
    case "highlight":
    case "moveToTarget":
    case "pasteFromClipboard":
    case "replaceWithTarget":
    case "rewrapWithPairedDelimiter":
    case "swapTargets":
    case "wrapWithPairedDelimiter":
      return action;
  }
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
