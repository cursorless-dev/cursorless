import { Range } from "vscode";

/** Unifies overlapping/intersecting ranges */
export default function unifyRanges(ranges: Range[]): Range[] {
  let run = true;
  while (run) {
    [ranges, run] = onePass(ranges);
  }
  return ranges;
}

function onePass(ranges: Range[]): [Range[], boolean] {
  const wrappers: { range: Range }[] = [];
  let madeChanges = false;
  ranges.forEach((range) => {
    const wrapper = wrappers.find(
      (wrapper) => wrapper.range.intersection(range) != null
    );
    // Update existing intersecting range
    if (wrapper != null) {
      wrapper.range = wrapper.range.union(range);
      madeChanges = true;
    }
    // Add new range
    else {
      wrappers.push({ range });
    }
  });
  const results = wrappers.map((wrapper) => wrapper.range);
  return [results, madeChanges];
}
