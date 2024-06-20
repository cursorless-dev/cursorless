import { fillPlaceholders } from "./fillPlaceholders";
import { parseAction } from "./parseCommand";

export function parseAndFillOutAction(content: string, args: unknown[]) {
  const parsed = parseAction(content);
  return fillPlaceholders(parsed, args);
}
