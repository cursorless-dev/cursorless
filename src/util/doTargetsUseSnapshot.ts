import { DecoratedSymbol, PartialTarget } from "../typings/Types";
import { uniq } from "lodash";
import { getPartialPrimitiveTargets } from "./targetUtils";

export function doTargetsUseSnapshot(targets: PartialTarget[]): boolean {
  const snapshotIds = getPartialPrimitiveTargets(targets)
    .filter((target) => target.mark?.type === "decoratedSymbol")
    .map((target) => (target.mark as DecoratedSymbol).useSnapshot);

  if (snapshotIds.length === 0) {
    return false;
  }

  const uniqueSnapshotIds = uniq(snapshotIds);

  if (uniqueSnapshotIds.length !== 1) {
    throw new Error("Must use the same snapshot id for all targets");
  }

  return uniqueSnapshotIds[0] ?? false;
}
