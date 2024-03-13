import { targetsToContinuousTarget } from "../processTargets/TargetPipelineRunner";
import { Target } from "../typings/target.types";
import { groupTargetsForEachEditor } from "./targetUtils";

/** Unifies overlapping/intersecting targets */
export function unifyRemovalTargets(targets: Target[]): Target[] {
  if (targets.length < 2) {
    return targets;
  }
  return groupTargetsForEachEditor(targets).flatMap(([_editor, targets]) => {
    if (targets.length < 2) {
      return targets;
    }
    let results = [...targets];
    results.sort((a, b) =>
      a.contentRange.start.compareTo(b.contentRange.start),
    );
    let run = true;
    // Merge targets until there are no overlaps/intersections
    while (run) {
      [results, run] = unifyTargetsOnePass(results);
    }
    return results;
  });
}

async function unifyTargetsOnePass(
  targets: Target[],
): Promise<[Target[], boolean]> {
  if (targets.length < 2) {
    return [targets, false];
  }
  const results: Target[] = [];
  let currentGroup: Target[] = [];
  for (let i = 0; i < targets.length; ++i) {
    const target = targets[i];
    // No intersection. Mark start of new group
    if (
      currentGroup.length &&
      !intersects(currentGroup[currentGroup.length - 1], target)
    ) {
      results.push(await mergeTargets(currentGroup));
      currentGroup = [target];
    } else {
      currentGroup.push(target);
    }
  }
  results.push(await mergeTargets(currentGroup));
  return [results, results.length !== targets.length];
}

async function mergeTargets(targets: Target[]): Promise<Target> {
  if (targets.length === 1) {
    return targets[0];
  }
  const first = targets[0];
  const last = targets[targets.length - 1];
  return await targetsToContinuousTarget(first, last);
}

async function intersects(targetA: Target, targetB: Target) {
  return !!(await targetA.getRemovalRange()).intersection(
    await targetB.getRemovalRange(),
  );
}
