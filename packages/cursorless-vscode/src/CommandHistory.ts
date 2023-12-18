import {
  ActionDescriptor,
  CommandComplete,
  CommandHistoryEntry,
  FileSystem,
  ReadOnlyHatMap,
} from "@cursorless/common";
import type {
  CommandRunner,
  CommandRunnerDecorator,
} from "@cursorless/cursorless-engine";
import { VscodeApi } from "@cursorless/vscode-common";
import produce from "immer";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as vscode from "vscode";

const filePrefix = "cursorlessCommandHistory";
const settingSection = "cursorless";
const settingName = "commandHistory";

/**
 * When user opts in, this class sanitizes and appends each Cursorless command
 * to a local log file in `.cursorless/commandHistory` dir.
 */
export class CommandHistory implements CommandRunnerDecorator {
  private readonly dirPath: string;
  private readonly cursorlessVersion: string;

  constructor(
    extensionContext: vscode.ExtensionContext,
    private vscodeApi: VscodeApi,
    fileSystem: FileSystem,
  ) {
    this.cursorlessVersion = extensionContext.extension.packageJSON.version;
    this.dirPath = fileSystem.cursorlessCommandHistoryDirPath;
  }

  wrapCommandRunner(
    _readableHatMap: ReadOnlyHatMap,
    runner: CommandRunner,
  ): CommandRunner {
    if (!this.isActive()) {
      return runner;
    }

    return {
      run: async (commandComplete: CommandComplete) => {
        try {
          const returnValue = await runner.run(commandComplete);

          await this.appendToLog(commandComplete);

          return returnValue;
        } catch (e) {
          await this.appendToLog(commandComplete, e as Error);
          throw e;
        }
      },
    };
  }

  private async appendToLog(
    command: CommandComplete,
    thrownError?: Error,
  ): Promise<void> {
    const date = new Date();
    const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;
    const file = path.join(this.dirPath, fileName);

    const historyItem: CommandHistoryEntry = {
      date: getDayDate(date),
      cursorlessVersion: this.cursorlessVersion,
      error: thrownError?.name,
      command: produce(command, sanitizeCommandInPlace),
    };
    const data = JSON.stringify(historyItem) + "\n";

    await fs.mkdir(this.dirPath, { recursive: true });
    await fs.appendFile(file, data, "utf8");
  }

  private isActive(): boolean {
    return this.vscodeApi.workspace
      .getConfiguration(settingSection)
      .get<boolean>(settingName, false);
  }
}

// Remove spoken form and sanitize action
function sanitizeCommandInPlace(command: CommandComplete): void {
  delete command.spokenForm;
  sanitizeActionInPlace(command.action);
}

function sanitizeActionInPlace(action: ActionDescriptor): void {
  switch (action.name) {
    // Remove replace with text
    case "replace":
      if (Array.isArray(action.replaceWith)) {
        action.replaceWith = [];
      }
      break;

    // Remove substitutions and custom body
    case "insertSnippet":
      delete action.snippetDescription.substitutions;
      if (action.snippetDescription.type === "custom") {
        action.snippetDescription.body = "";
      }
      break;

    case "wrapWithSnippet":
      if (action.snippetDescription.type === "custom") {
        action.snippetDescription.body = "";
      }
      break;

    case "executeCommand":
      delete action.options?.commandArgs;
      break;

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
    case "generateSnippet":
    case "getText":
    case "highlight":
    case "moveToTarget":
    case "pasteFromClipboard":
    case "replaceWithTarget":
    case "rewrapWithPairedDelimiter":
    case "swapTargets":
    case "wrapWithPairedDelimiter":
      break;

    default: {
      // Ensure we don't miss any new actions
      const _exhaustiveCheck: never = action;
    }
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
