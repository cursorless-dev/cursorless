import { ActionDescriptor } from "@cursorless/common";
import { fillPlaceholders } from "./fillPlaceholders";
import { parseAction } from "./parseCommand";

/**
 * Given a content string and a list of arguments, parse the content string into
 * an action descriptor and fill out the placeholders with the arguments.
 *
 *
 * @param content The content to parse
 * @param args The arguments to fill out the placeholders with
 * @returns An action descriptor with the placeholders filled out using
 * {@link args}
 */
export function parseAndFillOutAction(
  content: string,
  args: unknown[],
): ActionDescriptor {
  const parsed = parseAction(content);
  return fillPlaceholders(parsed, args);
}
