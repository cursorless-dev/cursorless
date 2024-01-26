import {
  CommandHistoryEntry,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import globRaw from "glob";
import { groupBy, map } from "lodash";
import { promisify } from "node:util";
import { asyncIteratorToList } from "./asyncIteratorToList";
import { canonicalizeAndValidateCommand } from "./core/commandVersionUpgrades/canonicalizeAndValidateCommand";
import { generateCommandHistoryEntries } from "./generateCommandHistoryEntries";
import { ide } from "./singletons/ide.singleton";
import { getPartialTargetDescriptors } from "./util/getPartialTargetDescriptors";
import { getPartialPrimitiveTargets } from "./util/getPrimitiveTargets";
import { getScopeType } from "./util/getScopeType";

export const glob = promisify(globRaw);

class Period {
  private readonly period: string;
  private readonly actions: Record<string, number> = {};
  private readonly modifiers: Record<string, number> = {};
  private readonly scopeTypes: Record<string, number> = {};
  private count: number = 0;

  constructor(period: string, entries: CommandHistoryEntry[]) {
    this.period = period;
    for (const entry of entries) {
      this.append(entry);
    }
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

  private append(entry: CommandHistoryEntry) {
    this.count++;
    const command = canonicalizeAndValidateCommand(entry.command);
    this.incrementAction(command.action.name);

    this.parsePrimitiveTargets(
      getPartialPrimitiveTargets(getPartialTargetDescriptors(command.action)),
    );
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

function getMonth(entry: CommandHistoryEntry): string {
  return entry.date.slice(0, 7);
}

async function generatePeriods(dir: string): Promise<string[]> {
  const entries = await asyncIteratorToList(generateCommandHistoryEntries(dir));

  return map(Object.entries(groupBy(entries, getMonth)), ([key, entries]) =>
    new Period(key, entries).toString(),
  );
}

export async function analyzeCommandHistory(dir: string) {
  const text = (await generatePeriods(dir)).join("\n\n");

  await ide().openUntitledTextDocument({ content: text });
}
