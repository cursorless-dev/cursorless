import {
  CommandHistoryEntry,
  Modifier,
  PartialPrimitiveTargetDescriptor,
  ScopeType,
} from "@cursorless/common";
import {
  getPartialPrimitiveTargets,
  getPartialTargetDescriptors,
  getScopeType,
} from "@cursorless/cursorless-engine";
import globRaw from "glob";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import * as vscode from "vscode";

const glob = promisify(globRaw);

class Month {
  readonly month: string;
  readonly actions: Record<string, number> = {};
  readonly modifiers: Record<string, number> = {};
  readonly scopeTypes: Record<string, number> = {};
  count: number = 0;

  constructor(month: string) {
    this.month = month;
  }

  toString(): string {
    return [
      `[${this.month}]`,
      `Total commands: ${this.count}`,
      `Actions:\n${this.serializeMap(this.actions)}`,
      `Modifiers:\n${this.serializeMap(this.modifiers)}`,
      `Scope types:\n${this.serializeMap(this.scopeTypes)}`,
    ].join("\n\n");
  }

  private serializeMap(map: Record<string, number>) {
    const entries = Object.entries(map);
    entries.sort((a, b) => b[1] - a[1]);
    return entries.map(([key, value]) => `  ${key}: ${value}`).join("\n");
  }

  append(entry: CommandHistoryEntry) {
    this.count++;
    this.incrementAction(entry.command.action.name);

    const partialTargets = getPartialTargetDescriptors(entry.command.action);
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

class Months {
  readonly months: Record<string, Month> = {};

  getMonth(entry: CommandHistoryEntry) {
    const monthDate = entry.date.slice(0, 7);

    if (!this.months[monthDate]) {
      this.months[monthDate] = new Month(monthDate);
    }

    return this.months[monthDate];
  }

  getMonths() {
    const months = Object.values(this.months);
    months.sort((a, b) => a.month.localeCompare(b.month));
    return months;
  }
}

async function analyzeFilesAndReturnMonths(dir: string): Promise<Month[]> {
  const files = await glob("*.jsonl", { cwd: dir });
  const months = new Months();

  for (const file of files) {
    const filePath = path.join(dir, file);
    const content = await readFile(filePath, "utf8");
    const lines = content.split("\n");

    for (const line of lines) {
      if (line.length === 0) {
        continue;
      }

      const entry = JSON.parse(line) as CommandHistoryEntry;
      const month = months.getMonth(entry);
      month.append(entry);
    }
  }

  return months.getMonths();
}

export async function analyzeCommandHistory(dir: string) {
  const months = await analyzeFilesAndReturnMonths(dir);
  const monthTexts = months.map((month) => month.toString());
  const text = monthTexts.join("\n\n") + "\n";

  const document = await vscode.workspace.openTextDocument({ content: text });
  await vscode.window.showTextDocument(document);
}
