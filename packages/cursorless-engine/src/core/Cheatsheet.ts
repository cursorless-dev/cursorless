import { readFile, writeFile } from "fs/promises";
import { parse } from "node-html-parser";
import produce from "immer";
import { sortBy } from "lodash";
import { ide } from "../singletons/ide.singleton";
import { homedir } from "os";
import path from "path";
import {
  CheatsheetInfo,
  CommandComplete,
  DestinationDescriptor,
  FeatureUsageStats,
  PartialTargetDescriptor,
} from "@cursorless/common";

/**
 * The argument expected by the cheatsheet command.
 */
interface CheatSheetCommandArg {
  /**
   * The version of the cheatsheet command.
   */
  version: 0;

  /**
   * A representation of all spoken forms that is used to generate the
   * cheatsheet.
   *
   * The command is called from talon and this is passed as one of the parameters.
   */
  spokenFormInfo: CheatsheetInfo;

  /**
   * The file to write the cheatsheet to
   */
  outputPath: string;
}

type FeatureUsed = {
  featureId: string;
  featureType: string;
};

/**
 * Despite the name, does not show the cheatsheet. Instead, it updates the cheatsheet file.
 * I should read history of this file to understand why all of this was not done on talon side.
 *
 * Usage stats will be collected extension side (source of truth for all things cursorless).
 */
export async function showCheatsheet({
  version,
  spokenFormInfo,
  outputPath,
}: CheatSheetCommandArg) {
  if (version !== 0) {
    throw new Error(`Unsupported cheatsheet api version: ${version}`);
  }

  // Appears to mismatch the linux path in the talon code
  const cheatsheetPath = path.join(ide().assetsRoot, "cheatsheet.html");

  const cheatsheetContent = (await readFile(cheatsheetPath)).toString();

  const featureUsageStats = await rollupThisMonthsCommandHistoryToFeatureUsage();

  const root = parse(cheatsheetContent);

  // Add usage stats here option #2
  // Like ... document.cheatsheetUsageStats

  // Inject data into the cheatsheet
  root.getElementById("cheatsheet-data").textContent = `
  document.cheatsheetInfo = ${JSON.stringify(spokenFormInfo)};
  
  document.cheatsheetFeatureUsageStats = ${JSON.stringify(featureUsageStats)};
  `;

  await writeFile(outputPath, root.toString());
}


/// Copied over from VSCodeCommandHistory (writes to the file)
function getMonthDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}

/**
 * Updates the default spoken forms stored in `spokenFormInfos.json` for
 * development.
 * @param spokenFormInfo The new value to use for default spoken forms.
 */
export async function updateDefaults(spokenFormInfo: CheatsheetInfo) {
  const { runMode, assetsRoot: _, workspaceFolders } = ide();

  const workspacePath =
    runMode === "development"
      // Code review note: Previously assetsRoot was used, during development its packages/cursorless-vscode/dist which does not make sense to me and does not let me debug
      ? process.env.CURSORLESS_REPO_ROOT
      : workspaceFolders?.[0].uri.path ?? null;

  if (workspacePath == null) {
    throw new Error(
      "Please update defaults from Cursorless workspace or running in debug",
    );
  }

  const sampleDataPath = path.join(
    workspacePath,
    "packages",
    "cheatsheet",
    "src",
    "lib",
    "sampleData",
  );

  const outputObject = produce(spokenFormInfo, (draft) => {
    draft.sections = sortBy(draft.sections, "id");
    draft.sections.forEach((section) => {
      section.items = sortBy(section.items, "id");
    });
  });

  const spokenFormInfosPath = path.join(sampleDataPath, "spokenFormInfos.json");
  await writeFile(spokenFormInfosPath, JSON.stringify(outputObject, null, "\t"));

  const featureUsageStats = await rollupThisMonthsCommandHistoryToFeatureUsage();
  const featureUsageStatsPath = path.join(sampleDataPath, "featureUsageStats.json");
  await writeFile(featureUsageStatsPath, JSON.stringify(featureUsageStats, null, "\t"));
}

async function rollupThisMonthsCommandHistoryToFeatureUsage(): Promise<FeatureUsageStats | undefined> {
  const commandHistoryThisMonth = await commandHistoryForThisMonth();

  if (!commandHistoryThisMonth) {
    return undefined
  }

  const featureUsageStats: FeatureUsageStats = {
    featureUsageCount: {},
  };

  const features = extractUsedFeatures(commandHistoryThisMonth)
  for (const { featureId } of features) {
    const featureUsageCount = (featureUsageStats.featureUsageCount[featureId] ?? 0) + 1;
    featureUsageStats.featureUsageCount[featureId] = featureUsageCount;
  }

  return featureUsageStats;
}

async function commandHistoryForThisMonth(): Promise<{ command: CommandComplete }[] | undefined> {


  // HACK: This command needs FileSystem instance to get cursorlessDir, for now prototyping so just hardcode it
  // Not tested on Windows / Linux
  //
  // Path is like ~/.cursorless/commandHistory/cursorlessCommandHistory_2023-12.jsonl
  const dirPath = path.join(homedir(), ".cursorless", "commandHistory");
  const filePrefix = "cursorlessCommandHistory";

  const date = new Date();
  const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;
  const usageStatisticsThisMonthPath = path.join(dirPath, fileName);


  let usageStatistics: Buffer | undefined;
  try {
    usageStatistics = await readFile(usageStatisticsThisMonthPath);
  } catch (error) {
    console.error(`Failed to read usage statistics from ${usageStatisticsThisMonthPath}`, error);
    return undefined;
  }

  const commandHistoryThisMonth: { command: CommandComplete }[] = (
    usageStatistics
  )
    .toString()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  return commandHistoryThisMonth;
}

function* extractUsedFeatures(commandHistoryThisMonth: { command: CommandComplete }[]): Generator<FeatureUsed> {
  for (const historyItem of commandHistoryThisMonth) {
    const {
      command: { action },
    } = historyItem;

    // firstly the action moveToTarget is used
    yield {
      featureId: action.name,
      featureType: "action",
    }

    // Hard part - extract the featureId from the action - actions have varying structures and there is no cannonical way to extract the featureId.
    // The structure is roughly
    // Action { target1, target2 ... }
    // Target { type, value, modifiers } example
    // Modifier { scope, type }
    // Scope - this is part of some modifiers. Things that are considered as 'scopes' in documentation -
    // are also modifiers so every scope is a modifier ?
    switch (action.name) {
      // Remove replace with text
      case "replace":
        yield* featuresUsedFromDestination(action.destination)
        break;

      case "moveToTarget": {
        // source is a target, destination usually contains a target
        const { source, destination } = action;

        // Common extraction for all targets
        yield* featuresUsedFromTarget(source)
        yield* featuresUsedFromDestination(destination)

        break;
      }

      // Remove substitutions and custom body
      case "insertSnippet": {
        const { snippetDescription, destination } = action;

        yield* featuresUsedFromDestination(destination)

        switch (snippetDescription.type) {
          case "named":
            yield {
              featureId: snippetDescription.name,
              featureType: "snippet",
            }
            break;
          case "custom":
            // noop - has no name / id
            break;
        }
        break;
      }

      // Remove custom body
      case "wrapWithSnippet":
        if (action.snippetDescription.type === "custom") {
          // noop
        }
        break;

      // All single target actions should be grouped together
      case "breakLine":
      case "setSelection":
      case "setSelectionAfter":
      case "setSelectionBefore":
      case "clearAndSetSelection":
      case "copyToClipboard":
      case "cutToClipboard":
      case "deselect":
      case "editNewLineAfter":
      case "editNewLineBefore":
      case "extractVariable":
      case "findInWorkspace":
      case "foldRegion":
      case "followLink":
      case "experimental.setInstanceReference":
        {
          const { target } = action;
          yield* featuresUsedFromTarget(target)
          break
        }

      // Next all with destinations
      case "pasteFromClipboard":
        yield* featuresUsedFromDestination(action.destination)
        break

      // Not categorized
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
      case "replaceWithTarget":
      case "rewrapWithPairedDelimiter":
      case "swapTargets":
      case "wrapWithPairedDelimiter":
    }
  }
}

function* featuresUsedFromTarget(target: PartialTargetDescriptor): Generator<FeatureUsed> {
  // Common extraction for all targets
  switch (target.type) {
    case "primitive":
      switch (target.type) {
        case "primitive":
          // Common for all modifiers
          for (const modifier of target.modifiers ?? []) {
            yield {
              featureId: modifier.type,
              featureType: "modifier",
            };

            if ("scopeType" in modifier) {
              // example: 'instance'
              yield {
                featureId: modifier.scopeType.type,
                featureType: "scope",
              }
            }
          }
      }

      break;
    case 'list':
      for (const childTarget of target.elements) {
        yield* featuresUsedFromTarget(childTarget);
      }
      break;
  }
}

function* featuresUsedFromDestination(destination: DestinationDescriptor): Generator<FeatureUsed> {
  switch (destination.type) {
    case "primitive":
      yield* featuresUsedFromTarget(destination.target);
      break;
    case "implicit":
      break;
    case "list":
      for (const childDestination of destination.destinations) {
        yield* featuresUsedFromTarget(childDestination);
      }
      break;
  }
}