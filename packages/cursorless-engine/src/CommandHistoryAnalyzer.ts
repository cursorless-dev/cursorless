import {
  CommandHistoryEntry,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import globRaw from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { ide } from "./singletons/ide.singleton";
import { getPartialTargetDescriptors } from "./util/getPartialTargetDescriptors";
import { getPartialPrimitiveTargets } from "./util/getPrimitiveTargets";
import { getScopeType } from "./util/getScopeType";

const glob = promisify(globRaw);

class Period {
  readonly period: string;
  readonly actions: Record<string, number> = {};
  readonly modifiers: Record<string, number> = {};
  readonly scopeTypes: Record<string, number> = {};
  count: number = 0;

  constructor(period: string) {
    this.period = period;
  }

  toString(): string {
    return [
      `[${this.period}]`,
      `Total commands: ${this.count}`,
      this.serializeMap("Actions", this.actions),
      this.serializeMap("Modifiers", this.modifiers),
      this.serializeMap("Scope types", this.scopeTypes),
    ].join("\n\n");
  }

  private serializeMap(name: string, map: Record<string, number>) {
    const entries = Object.entries(map);
    entries.sort((a, b) => b[1] - a[1]);
    const entriesSerialized = entries
      .map(([key, value]) => `  ${key}: ${value}`)
      .join("\n");
    return `${name} (${entries.length}):\n${entriesSerialized}`;
  }

  append(entry: CommandHistoryEntry) {
    this.count++;
    const command = canonicalizeAndValidateCommand(entry.command);
    this.incrementAction(command.action.name);

    const partialTargets = getPartialTargetDescriptors(command.action);
    const partialPrimitiveTargets = getPartialPrimitiveTargets(partialTargets);
    this.parsePrimitiveTargets(partialPrimitiveTargets);
  }

  private parsePrimitiveTargets(
    partialPrimitiveTargets: PartialPrimitiveTargetDescriptor[],
  ) {
    for (const target of partialPrimitiveTargets) {
      if (target.modifiers == null) {
        continue;
      }
      for (const modifier of target.modifiers) {
        this.incrementModifier(modifier);

        const scopeType = getScopeType(modifier);
        if (scopeType != null) {
          this.incrementScope(scopeType);
        }
      }
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

class Periods {
  readonly periods: Record<string, Period> = {};

  getMonth(entry: CommandHistoryEntry) {
    const date = entry.date.slice(0, 7);

    if (!this.periods[date]) {
      this.periods[date] = new Period(date);
    }

    return this.periods[date];
  }

  getPeriods() {
    const periods = Object.values(this.periods);
    periods.sort((a, b) => a.period.localeCompare(b.period));
    return periods;
  }
}

async function analyzeFilesAndReturnMonths(dir: string): Promise<Period[]> {
  const files = await glob("*.jsonl", { cwd: dir });
  const periods = new Periods();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      const entry = JSON.parse(line) as CommandHistoryEntry;
      const month = periods.getMonth(entry);
      month.append(entry);
    }
  }

  return periods.getPeriods();
}

export async function analyzeCommandHistory(dir: string) {
  const months = await analyzeFilesAndReturnMonths(dir);
  const monthTexts = months.map((month) => month.toString());
  const text = monthTexts.join("\n\n") + "\n";

  await ide().openUntitledTextDocument({ content: text });
}
