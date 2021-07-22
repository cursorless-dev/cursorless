import { Range } from "vscode";

/** Unifies overlapping/intersecting ranges */
export default function unifyRanges(ranges: Range[]): Range[] {
  let haveChanges = true;
  while (haveChanges) {
    [ranges, haveChanges] = onePass(ranges);
  }
  return ranges;
}

function onePass(ranges: Range[]): [Range[], boolean] {
  const wrappers: { range: Range }[] = [];
  let haveChanges = false;
  ranges.forEach((range) => {
    const wrapper = wrappers.find(
      (wrapper) => wrapper.range.intersection(range) != null
    );
    if (wrapper != null) {
      wrapper.range = wrapper.range.union(range);
      haveChanges = true;
    } else {
      wrappers.push({ range });
    }
  });
  const results = wrappers.map((wrapper) => wrapper.range);
  return [results, haveChanges];
}
