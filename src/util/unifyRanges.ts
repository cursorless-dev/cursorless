import { Range } from "vscode";

/** Unifies overlapping/intersecting ranges */
export default function unifyRanges(ranges: Range[]): Range[] {
  if (ranges.length < 2) {
    return ranges;
  }
  let run = true;
  while (run) {
    [ranges, run] = onePass(ranges);
  }
  return ranges;
}

function onePass(ranges: Range[]): [Range[], boolean] {
  if (ranges.length < 2) {
    return [ranges, false];
  }
  const result: Range[] = [];
  let madeChanges = false;
  ranges.forEach((range) => {
    const index = result.findIndex((r) => r.intersection(range) != null);
    // Update existing intersecting range
    if (index > -1) {
      result[index] = result[index].union(range);
      madeChanges = true;
    }
    // Add new range
    else {
      result.push(range);
    }
  });
  return [result, madeChanges];
}
