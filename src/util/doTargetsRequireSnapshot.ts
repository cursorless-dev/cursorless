import { PartialTarget } from "../typings/Types";
import { uniq } from "lodash";
import { getPartialPrimitiveTargets } from "./targetUtils";

export function doTargetsUseSnapshot(targets: PartialTarget[]): boolean {
  const snapshotIds = getPartialPrimitiveTargets(targets).map((target) =>
    target.mark?.type === "decoratedSymbol"
      ? target.mark.useSnapshot
      : undefined
  );

  const uniqueSnapshotIds = uniq(snapshotIds);

  if (uniqueSnapshotIds.length !== 1) {
    throw new Error("Must use the same snapshot id for all targets");
  }

  return uniqueSnapshotIds[0] ?? false;
}
