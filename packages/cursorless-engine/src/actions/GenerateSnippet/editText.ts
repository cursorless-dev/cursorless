import { sortBy } from "lodash";
import type { Offsets } from "../../processTargets/modifiers/surroundingPair/types";

/**
 * For each edit in {@link edits} replaces the given {@link Edit.offsets} in
 * {@link text} with {@link Edit.text}.
 *
 * @param text The text to edit
 * @param edits The edits to perform
 * @returns The edited string
 */
export function editText(text: string, edits: Edit[]): string {
  const sortedEdits = sortBy(edits, (edit) => edit.offsets.start);
  let output = "";
  let currentOffset = 0;

  for (const edit of sortedEdits) {
    output += text.slice(currentOffset, edit.offsets.start) + edit.text;
    currentOffset = edit.offsets.end;
  }

  output += text.slice(currentOffset);

  return output;
}

interface Edit {
  offsets: Offsets;
  text: string;
}
