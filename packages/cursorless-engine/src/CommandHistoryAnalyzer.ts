import type {
  CommandHistoryEntry,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import { showWarning, type CommandHistoryStorage } from "@cursorless/common";
import { groupBy, map, sum } from "lodash-es";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { ide } from "./singletons/ide.singleton";
import { getPartialTargetDescriptors } from "./util/getPartialTargetDescriptors";
import { getPartialPrimitiveTargets } from "./util/getPrimitiveTargets";
import { getScopeType } from "./util/getScopeType";

/**
 * Analyzes the command history for a given time period, and outputs a report
 */
class Period {
  private readonly period: string;
  private readonly actions: Record<string, number> = {};
  private readonly modifiers: Record<string, number> = {};
  private readonly scopeTypes: Record<string, number> = {};
  private readonly dates = new Set<string>();
  private readonly commandCount: number;
  private decoratedMarkCommandCount: number = 0;

  constructor(period: string, entries: CommandHistoryEntry[]) {
    this.period = period;
    this.commandCount = entries.length;
    for (const entry of entries) {
      this.append(entry);
    }
  }

  toString(): string {
    const avgCommandsPerDay = Math.round(this.commandCount / this.dates.size);
    const percentageDecoratedMarkCommands = Math.round(
      (100 * this.decoratedMarkCommandCount) / this.commandCount,
    );
    const meta = [
      `Command count: ${this.commandCount}`,
      `Days used: ${this.dates.size}`,
      `Average commands / day: ${avgCommandsPerDay}`,
      `Commands with hats: ${this.decoratedMarkCommandCount} (${percentageDecoratedMarkCommands}%)`,
    ].join("\n");
    return [
      `# ${this.period}`,
      meta,
      this.serializeMap("Actions", this.actions),
      this.serializeMap("Modifiers", this.modifiers),
      this.serializeMap("Scope types", this.scopeTypes),
    ].join("\n\n");
  }

  private serializeMap(name: string, map: Record<string, number>) {
    const total = sum(Object.values(map));
    const entries = Object.entries(map);
    entries.sort((a, b) => b[1] - a[1]);
    const entriesSerialized = entries
      .map(([key, value]) => `  ${key}: ${value} (${toPercent(value / total)})`)
      .join("\n");
    return `${name}:\n${entriesSerialized}`;
  }

  private append(entry: CommandHistoryEntry) {
    this.dates.add(entry.date);
    const command = canonicalizeAndValidateCommand(entry.command);
    this.incrementAction(command.action.name);

    this.parsePrimitiveTargets(
      getPartialPrimitiveTargets(getPartialTargetDescriptors(command.action)),
    );
  }

  private parsePrimitiveTargets(
    partialPrimitiveTargets: PartialPrimitiveTargetDescriptor[],
  ) {
    let hasDecoratedMark = false;
    for (const target of partialPrimitiveTargets) {
      if (target.mark?.type === "decoratedSymbol") {
        hasDecoratedMark = true;
      }

      for (const modifier of target.modifiers ?? []) {
        this.incrementModifier(modifier);

        const scopeType = getScopeType(modifier);
        if (scopeType != null) {
          this.incrementScope(scopeType);
        }
      }
    }

    if (hasDecoratedMark) {
      this.decoratedMarkCommandCount++;
    }
  }

  private incrementAction(actionName: string) {
    this.actions[actionName] = (this.actions[actionName] ?? 0) + 1;
  }

  private incrementModifier(modifier: Modifier) {
    this.modifiers[modifier.type] = (this.modifiers[modifier.type] ?? 0) + 1;
  }

  private incrementScope(scopeType: ScopeType) {
    this.scopeTypes[scopeType.type] =
      (this.scopeTypes[scopeType.type] ?? 0) + 1;
  }
}

function getMonth(entry: CommandHistoryEntry): string {
  return entry.date.slice(0, 7);
}

export async function analyzeCommandHistory(
  commandHistoryStorage: CommandHistoryStorage,
) {
  const entries = await commandHistoryStorage.getEntries();

  if (entries.length === 0) {
    const TAKE_ME_THERE = "Show me";
    const result = await showWarning(
      ide().messages,
      "noHistory",
      "No command history entries found. Please enable the command history in the settings.",
      TAKE_ME_THERE,
    );

    if (result === TAKE_ME_THERE) {
      // FIXME: This is VSCode-specific
      await ide().executeCommand(
        "workbench.action.openSettings",
        "cursorless.commandHistory",
      );
    }

    return;
  }

  const content = [
    new Period("Totals", entries).toString(),

    ...map(Object.entries(groupBy(entries, getMonth)), ([key, entries]) =>
      new Period(key, entries).toString(),
    ),
  ].join("\n\n\n");

  await ide().openUntitledTextDocument({ content });
}

function toPercent(value: number) {
  return Intl.NumberFormat(undefined, {
    style: "percent",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
